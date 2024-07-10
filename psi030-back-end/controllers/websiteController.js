const Website = require("../models/website");

const page_controller = require("../controllers/pageController");

const asyncHandler = require("express-async-handler");


// Display list of all Websites.
exports.website_list = asyncHandler(async (req, res, next) => {
  const allWebsites = await Website.find().exec();
  res.json(allWebsites);
});


// Display detail page for a specific Website.
exports.website_detail = asyncHandler(async (req, res, next) => {

  let receivedUrl = decodeURIComponent(req.params.url);
  // Get details of website
  const [website] = await Promise.all([
    Website.findOne({ url: receivedUrl }).populate('pages').exec(),
  ]);
  if (website === null) {
    // No results.
    const err = new Error("Website not found");
    err.status = 404;
    return next(err);
  }

  res.json(website);
});


// Handle website create on POST.
exports.website_create_post = asyncHandler(async (req, res, next) => {

  let receivedUrl = decodeURIComponent(req.body.url);
  // Regular expression to match URL format
  const urlRegex = /^(http|https):\/\/[^ \/]+(\.[^ \/]{2,})+(\/.*)?$/;

  // Check if the URL format is correct
  if (!urlRegex.test(receivedUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  
  // Data from form is valid. Create a Website object
  let website = new Website({
    url: receivedUrl,
    dataRegisto: new Date(),
    estado: "Por avaliar",
  });

  // Save website.
  await website.save();
  res.json(website);
});


exports.get_website = asyncHandler(async (url) => {
  
  // Get details of website
  const [website] = await Promise.all([
    Website.findOne({ url: url }).populate('pages').exec(),
  ]);
  if (website === null) {
    // No results.
    return null;
  }
  return website;
});


//Usado apenas para debug
exports.website_delete = asyncHandler(async (req, res, next) => {

  let receivedUrl = decodeURIComponent(req.body.url);
  // Get details of website
  const website = await this.get_website(receivedUrl);
  if (!website) {
    // No results.
    const err = new Error("Website not found");
    err.status = 404;
    return next(err);
  }

  //Get the pages associated to the website
  const pages = website.pages;
  if (pages && pages.length !== 0) {
    // Delete all pages associated with the website
    for (const page of pages) {
      await page_controller.delete_page(page.url);
    }
  }
  
  // Delete the website itself
  await Website.deleteOne({ url: receivedUrl });
  
  res.json(website);
});


// Atualiza o estado do website de acordo com os estados das suas paginas
exports.update_estado = asyncHandler(async (url_website) => {

  let website = await this.get_website(url_website);
  if (!website) {
    // No results.
    const err = new Error("Website not found");
    err.status = 404;
    return next(err);
  }

  let erro = false, avaliado = false, por_aval = false, em_aval = false;

  // analisa os estados das paginas
  if (website.pages) {
    for (const page of website.pages) {
      if (page.estado === "Por avaliar") 
        por_aval = true;
      else if (page.estado === "Erro na avaliação")
        erro = true;
      else if (page.estado === "Em avaliação")
        em_aval = true;
      else
        avaliado = true;
    }
  }

  // atualiza o estado do website consoante a analise das paginas
  if(erro) {
    website.estado = "Erro na avaliação";
  } else if(em_aval) {
    website.estado = "Em avaliação";
  } else {
    if (avaliado) {
      if(por_aval) {
        website.estado = "Em avaliação";
      } else {
        website.estado = "Avaliado";
      } 
    } else {
      website.estado = "Por avaliar";
    }
  }
  // guarda o estado atualizado na base de dados
  await website.save();
});