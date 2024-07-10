import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { MdDialog } from '@material/web/dialog/dialog';
import { WebsiteService } from '../website.service';
import { Page } from '../page';
import { Evaluation } from '../evaluation';
import { Test, TiposTeste } from '../test';
import { Elemento, Resultado } from '../elemento';

import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/fab/fab.js';
import '@material/web/fab/branded-fab.js';

import '@material/web/textfield/outlined-text-field';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/checkbox/checkbox.js';

@Component({
  selector: 'app-page-evaluation-details',
  templateUrl: './page-evaluation-details.component.html',
  styleUrls: ['./page-evaluation-details.component.css']
})
export class PageEvaluationDetailsComponent implements OnInit {


  public page: Page | undefined;
  public evaluation: Evaluation | undefined;
  public testsList: Test[] = [];
  public currentElementsList: Elemento[] = [];

  public totalTests: number = 0;
  public currentTest: Test | undefined;
  public dialog: MdDialog | undefined;
  
  public listaFiltrada: Test[] = [];
  public filtrada: boolean = false;
  public selectedFiltersTipo: string[] = [];
  public selectedFiltersResultado: string[] = [];
  public selectedFiltersNivel: string[] = [];

  // para o html ter acesso aos tipos TiposTeste e Resultado 
  public tipos: string[] = Object.values(TiposTeste).map(value => String(value));
  public resultados: string[] = Object.values(Resultado).map(value => String(value));
  public niveis: string[] = ["A", "AA", "AAA"];

  constructor(
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    window.scrollTo(0,0);
    this.getPage();
    this.getEvaluation();
  }

  public goBack(): void {
    this.location.back();
  }

  getPage(): void {
    let url = String(this.route.snapshot.paramMap.get('url'));
    let encodedUrl = encodeURIComponent(url);
    this.websiteService.getPage(String(encodedUrl))
      .subscribe(page => {
        this.page = page;
        this.getEvaluation();
      });
  }

  getEvaluation(): void {
    if (this.page?.evaluation) {
      this.websiteService.getEvaluation(this.page?.evaluation._id)
      .subscribe(evaluation => {
        this.evaluation = evaluation;
        this.totalTests = evaluation.num_failed + evaluation.num_warning + evaluation.num_passed + evaluation.num_inapplicable;
        this.getTests();
      });
    }
  }

  getTests(): void {
    if(this.evaluation?.tests) {
      this.websiteService.getTests(this.evaluation?._id)
        .subscribe(tests => {
          this.testsList = tests;
        });
    }
  }

  getElementos(): void {
      if(this.currentTest?.elementos) {
        this.websiteService.getElementos(this.currentTest._id)
        .subscribe(elements => {
          this.currentElementsList = elements;
        });
      }
    
  }

  getNumPassed(): number {
    return this.evaluation ? this.evaluation?.num_passed : 0;
  }
  getNumWarning(): number {
    return this.evaluation ? this.evaluation?.num_warning : 0;
  }
  getNumFailed(): number {
    return this.evaluation ? this.evaluation?.num_failed : 0;
  }
  getNumInapplicable(): number {
    return this.evaluation ? this.evaluation?.num_inapplicable : 0;
  }

  displayUrl(): string {
    return this.page?.url ?? '';
  }

  mostrarElementos(event: Event, test: Test): void{
    this.currentTest = test;
    event.stopPropagation();
    this.getElementos();
    this.dialog = document.getElementById("my-dialog") as MdDialog;
    this.dialog.show();  
  }

  cancel(): void{
    // do nothing
  }

  closeDialog():void {
    this.dialog?.close();
  }

  public toggleFilterTipo(filter: string): void {
    const index = this.selectedFiltersTipo.indexOf(filter);
    if (index === -1) {
      this.selectedFiltersTipo.push(filter); // Add filter if not already selected
    } else {
      this.selectedFiltersTipo.splice(index, 1); // Remove filter if already selected
    }
    this.filterTests(); // Apply filters to the list
  }

  public toggleFilterResultado(filter: string): void {
    const index = this.selectedFiltersResultado.indexOf(filter);
    if (index === -1) {
      this.selectedFiltersResultado.push(filter); // Add filter if not already selected
    } else {
      this.selectedFiltersResultado.splice(index, 1); // Remove filter if already selected
    }
    this.filterTests(); // Apply filters to the list
  }

  public toggleFilterNivel(filter: string): void {
    const index = this.selectedFiltersNivel.indexOf(filter);
    if (index === -1) {
      this.selectedFiltersNivel.push(filter); // Add filter if not already selected
    } else {
      this.selectedFiltersNivel.splice(index, 1); // Remove filter if already selected
    }
    this.filterTests(); // Apply filters to the list
  }

  public filterTests(): void {
    // reseta a lista filtrada
    this.filtrada = false;
    this.listaFiltrada = this.testsList;

    // filtra por tipo, se selecionado
    if (this.selectedFiltersTipo.length > 0) {
      this.filtrada = true;
      this.listaFiltrada = this.listaFiltrada.filter(test =>
        this.selectedFiltersTipo.includes(test.tipo.toString())
      );
    }
    // filtra por resultado, se selecionado
    if (this.selectedFiltersResultado.length > 0) {
      this.filtrada = true;
      this.listaFiltrada = this.listaFiltrada.filter(test =>
        this.selectedFiltersResultado.includes(test.resultado.toString())
      );
    }
    // filtra por nivel, se selecionado
    if (this.selectedFiltersNivel.length > 0) {
      this.filtrada = true;
      this.listaFiltrada = this.listaFiltrada.filter(test =>
        test.nivel.some(n => this.selectedFiltersNivel.includes(n.toString()))
      );
    }
  }

}