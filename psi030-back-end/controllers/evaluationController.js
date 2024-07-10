const Evaluation = require("../models/evaluation");
const Test = require("../models/test");
const Element = require("../models/element");

const website_controller = require("../controllers/websiteController");
const page_controller = require("../controllers/pageController");
const test_controller = require("../controllers/testController");

const asyncHandler = require("express-async-handler");
const { QualWeb } = require('@qualweb/core');

// o avaliador usa instâncias do browser Chrome para executar a avaliação
// definir as diferentes opções a usar
// plugins para bloquear anúncios e para que não seja detectado que o browser que está a ser usado em modo automático
const plugins = {
  adBlock: false, // Default value = false
  stealth: true // Default value = false
};

// o avaliador cria um cluster de páginas em avaliação
// definir o tempo que cada tab do browser vai esperar pelo fim do carregamento da página
const clusterOptions = {
  maxConcurrency: 3, // Performs several urls evaluations at the same time - the higher the number given, more resources will be used. Default value = 1
  timeout: 60 * 1000, // Timeout for loading page. Default value = 30 seconds
};

// opções para lançamento do browser
const launchOptions = {
  args: ['--no-sandbox', '--ignore-certificate-errors']  // caso dê erro tentar com isto 
};



exports.evaluation_details = asyncHandler(async (req, res, next) => {

  // Get details of evaluation
  const [eval] = await Promise.all([
    Evaluation.findOne({ _id: req.params.id }).populate('tests').exec(),
  ]);
  if (!eval) {
    // No results.
    const err = new Error("Evaluation not found");
    err.status = 404;
    return next(err);
  }

  if (eval.tests && eval.tests.length > 0) {
    // Populate each test with its elements
    await Evaluation.populate(eval.tests, { path: "elementos" });
  }

  res.json(eval);
});


// Start the evaluation of a website on POST
exports.evaluate_website = asyncHandler(async (req, res, next) => {
  
  // criar instância do avaliador
  const qualweb = new QualWeb(plugins);
  
  // iniciar o avalidor
  await qualweb.start(clusterOptions, launchOptions);
  
  // obtem o website que vai avaliar
  let url_website = decodeURIComponent(req.params.url);
  let website = await website_controller.get_website(url_website);
  if (!website) {
    // No results.
    const err = new Error("Website not found");
    err.status = 404;
    return next(err);
  }

  // muda o estado do website e guarda na base de dados 
  website.estado = "Em avaliação";
  await website.save();

  // vai avaliar um link de cada vez
  for (const link of req.body) {
    
    // descodifica o url da page
    const url = decodeURIComponent(link.url);
    
    // get the page object from database
    let page = await page_controller.get_page(url);
    if (!page) {
      // No results.
      const err = new Error("Page not found");
      err.status = 404;
      return next(err);
    }
    
    // QualWeb evaluation report
    const qualwebOptions = {
      execute: {
        // choose which modules to execute
        // if this option is not specified, the default values below will be applied, otherwise unspecified values will default to false
        "wappalyzer": false, // wappalyzer module (https://github.com/qualweb/wappalyzer)
        "act": true, // act-rules module (https://github.com/qualweb/act-rules)
        "wcag": true, // wcag-techniques module (https://github.com/qualweb/wcag-techniques)
        "bp": false, // best-practices module (https://github.com/qualweb/best-practices)
        "counter": false // counter module (https://github.com/qualweb/counter)
      },
      url: url,
    };

    // muda o estado da pagina e guarda na base de dados 
    page.estado = "Em avaliação";
    await page.save();

    // Evaluates the given options - will only return after all urls have finished evaluating or resulted in an error
    const report = await qualweb.evaluate(qualwebOptions);

    // Check se houve erros na avaliacao
    if (report[url]) {

      let data = Date.now();
      
      // update data avaliacao da pagina e do website
      page.dataAval = data;
      website.dataAval = data;
      await page.save(); 
      await website.save(); 
      
      // update estado (conforme ou nao conforme) e erros segundo o relatorio
      await this.update_evaluation(page, report[url])
      
    } else {
      // se o relatiorio estiver vazio ocorreu um erro
      page.estado = "Erro na avaliação";
      await page.save();
    }
  }
  
  // alterar estado do website apos avaliacao
  await website_controller.update_estado(url_website);

  // Stops the QualWeb core engine
  await qualweb.stop();

  return res.json({ message: 'Avaliacao concluida'});
});


exports.update_evaluation = asyncHandler(async (page, report) => {

  let eval = new Evaluation({  
    num_passed: report.metadata.passed,
    num_warning: report.metadata.warning,
    num_failed: report.metadata.failed,
    num_inapplicable: report.metadata.inapplicable,
    tests: [],
  });
  
  // guarda a avaliacao na BD
  await this.check_tests(report, eval, 'act-rules');
  await this.check_tests(report, eval, 'wcag-techniques');
  await eval.save();

  // atualiza o estado da pagina
  if (eval.tem_erro_A || eval.tem_erro_AA)
    page.estado = "Não conforme";
  else 
    page.estado = "Conforme";

  // apaga a avaliacao anterior, caso exista
  if (page.evaluation)
    await this.evaluation_delete(page.evaluation._id);

  // guarda a nova avaliacao na pagina
  page.evaluation = eval._id;
  // guarda as atualizacoes da pagina na BD
  await page.save();
});


exports.check_tests = asyncHandler(async (report, eval, modulo) => {

  let assertions = report.modules[modulo].assertions;
  let tipo, resultado, nivel, elementos;

  if(modulo === 'act-rules') {
    tipo = "Regra ACT";
  } else {
    tipo = "Técnica WCAG";
  }
  
  // percorre os testes
  for (const key in assertions) {
    if (Object.hasOwnProperty.call(assertions, key)) {
      let test = assertions[key];
      let success_criteria = test.metadata['success-criteria'];
      let a = false, aa = false, aaa = false;
      nivel = new Set(), elementos = [];
      
      // obtem o resultado geral do teste
      if (test.metadata.failed > 0) {
        resultado = "Falhado";
      } else if (test.metadata.warning > 0) {
        resultado = "Aviso";
      } else if (test.metadata.passed > 0) {
        resultado = "Passado";
      } else {
        resultado = "Não aplicável";
      }
      
      // obtem o nivel de conformidade do teste
      if (success_criteria) {
        for (const criterion of success_criteria) {
          if (criterion.level === "A") {
            a = true;
            nivel.add("A");
          } else if (criterion.level === "AA") {
            aa = true;
            nivel.add("AA");
          } else if (criterion.level === "AAA") {
            aaa = true;
            nivel.add("AAA");
          }
        }
      }  

      // percorre os results do teste
      for (const result of test.results) {
        
        // obtem o resultado deste result
        let resultado_teste;
        if (result.verdict === "failed") {
          resultado_teste = "Falhado";
        } else if (result.verdict === "warning") {
          resultado_teste = "Aviso";
        } else if (result.verdict === "passed") {
          resultado_teste = "Passado";
        } else {
          resultado_teste = "Não aplicável";
        }
        
        //console.log("result: " + result);
        //console.log("verdict: " + result.verdict);
        for (const elem of result.elements) {
          //console.log("htmlCode: " + result.htmlCode);
          // guarda o elemento testado na BD
          let element = new Element({
            elemento: elem.htmlCode,
            resultado: resultado_teste,
          });
          await element.save();
          // associa o elemento ao teste
          elementos.push(element._id);
        }

        // se for um erro guarda essa informacao na avaliacao
        if (success_criteria && result.verdict === "failed") {
          if (a)
            eval.tem_erro_A = true;
          if (aa)
            eval.tem_erro_AA = true;
          if (aaa)
            eval.tem_erro_AAA = true;
          
          if (eval.erros[key])
            eval.erros[key] += 1;
          else
            eval.erros[key] = 1;
        }
      }

      //cria e guarda o teste na BD
      let testBD = new Test({
        nome: key,
        tipo: tipo,
        resultado: resultado,
        nivel: Array.from(nivel),
        elementos: elementos,
      });
      await testBD.save();
      // associa o teste à avaliacao
      eval.tests.push(testBD._id);
    }
  }
});


exports.evaluation_delete = asyncHandler(async (eval_id) => {

  // Find the evaluation by URL
  const [evaluation] = await Promise.all([
    Evaluation.findOne({ _id: eval_id }).exec(),
  ]);
  if (evaluation) {
    //Get the tests associated to the evaluation
    const tests = evaluation.tests;
    if (tests) {
      // Delete all the tests associated to the evaluation
      for (const test_id of tests) {
        await test_controller.test_delete(test_id);
      }
    }

    // Delete the evaluation from the database
    await Evaluation.deleteOne({ _id: evaluation._id });
  }
});