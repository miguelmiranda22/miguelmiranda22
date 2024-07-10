import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';


import { WebsiteService } from '../website.service';
import { Website } from '../website';
import { EstadosPage, Page } from '../page';
import { Evaluation } from '../evaluation';

import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/fab/fab.js';
import '@material/web/fab/branded-fab.js';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-website-detail',
  templateUrl: './website-detail.component.html',
  styleUrls: ['./website-detail.component.css'],
})

export class WebsiteDetailComponent implements OnInit {



  @ViewChild('pageUrl') pageUrl: any;

  public website: Website | undefined;
  public pagesList: Page[] = [];
  public paginasSelecionadas: Page[] = [];
  public addResult: boolean = true;
  public sameDomain: boolean = true;

  totalPagesEvaluated: number = 0;
  pagesWithErrors: number = 0;
  pagesWithLevelAErrors: number = 0;
  pagesWithLevelAaErrors: number = 0;
  pagesWithLevelAaaErrors: number = 0;
  errosList: any = {};
  commonAccessibilityErrors: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private location: Location,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
  ) { }



  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.getWebsite();
  }

  public goBack(): void {
    this.location.back();
  }

  getWebsite(): void {

    let url = String(this.route.snapshot.paramMap.get('url'));
    let encodedUrl = encodeURIComponent(url);
    this.websiteService.getWebsite(String(encodedUrl))
      .subscribe(website => {
        this.website = website;
        this.getPages();
      });
  }

  getPages(): void {
    if (this.website?.url) {
      let url = encodeURIComponent(this.website?.url)
      this.websiteService.getPages(url)
        .subscribe(pages => {
          this.pagesList = pages;
          this.calcularIndicadoresAcessibilidade();
        });
    }
  }

  add(url: string): void {

    if (this.website?.url) {

      let patt = new RegExp(/^(http|https):\/\/[^ \/]+(\.[^ \/]{2,})+(\/.*)?$/);

      let urlWebsite = this.website.url;

      let trimmed_url = url.trim();
      if (patt.test(trimmed_url) && !(trimmed_url.charAt(trimmed_url.length - 1) === '/')) {

        if (url.substring(0, urlWebsite.length) === urlWebsite && url !== urlWebsite && url !== urlWebsite + '/') {
          this.sameDomain = true
          this.pageUrl.nativeElement.value = '';;
          this.addResult = true;
          urlWebsite = encodeURIComponent(urlWebsite);
          url = encodeURIComponent(url)

          if (!url) { return; }
          this.websiteService.addPage(urlWebsite, { url } as Page)
            .subscribe(page => {
              this.pagesList.push(page);
              this.changeDetector.detectChanges();
            });
          window.location.reload();
        }
        else {
          this.sameDomain = false;
        }

      } else {
        this.addResult = false;
      }
    }
  }

  public onUrlChange(event: KeyboardEvent): void {
    this.addResult = true;
    this.sameDomain = true;
  }

  displayUrl(): string {
    return this.website?.url ?? '';
  }

  displayDataRegisto(): string {
    if (this.website) {
      return this.formataData(this.website.dataRegisto);
    }
    return '';
  }

  displayDataAval(): string {
    if (this.website) {
      return this.formataData(this.website.dataAval);
    }
    return ' ';
  }

  public formataData(inputDate: Date): string {
    if (inputDate != null) {
      const dateWithHour = new Date(inputDate);
      let stringDate = inputDate.toString();
      stringDate = stringDate.slice(stringDate.indexOf('T') + 1)

      dateWithHour.setHours(Number(stringDate.slice(0, 2)) + 1, Number(stringDate.slice(3, 5)))
      dateWithHour.setSeconds(Number(stringDate.slice(6, 8)));

      const options: Intl.DateTimeFormatOptions = {
        weekday: undefined,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };

      return dateWithHour.toLocaleString('pt-PT', options);
    }
    return "Sem Avaliação"
  }

  public getEstado(estado: EstadosPage): string {
    if (estado != null) {
      return estado.toString();
    }
    return "Sem Avaliação"
  }

  deleteWebsite(): void {

    if (this.website) {
      let url = encodeURIComponent(this.website.url);

      if (this.website?.pages.length > 0) {
        const confirmar = confirm("Apagar website e todas as páginas associadas?");

        if (confirmar) {
          this.pagesList = [];
          this.websiteService.deleteWebsite({ url } as Website).subscribe();
          this.router.navigate(['../websites']);
          return;
        }
        return;
      }
      this.websiteService.deleteWebsite({ url } as Website).subscribe();
      this.router.navigate(['../websites']);
    }
    return;

  }
   
  toggleSelection(page: Page): void {
    const index = this.paginasSelecionadas.indexOf(page);
    if (index > -1) {
      this.paginasSelecionadas.splice(index, 1);
    } else {
      this.paginasSelecionadas.push(page);
    }
  }

  isSelected(page: Page): boolean {
    return this.paginasSelecionadas.includes(page);
  }

  apagarSelecionadas() {

    let pageListEncoded: Object[] = []

    this.paginasSelecionadas.forEach(page => {
      this.apagarPagina(page)
      let pageEncoded = { ...page }
      pageEncoded.url = encodeURIComponent(pageEncoded.url)
      pageListEncoded.push({ url: pageEncoded.url })
    });

    if (this.website) {
      let encondedUrl = encodeURIComponent(this.website?.url)

      this.websiteService.deletePages(encondedUrl, pageListEncoded).subscribe();
      this.paginasSelecionadas = [];
      window.location.reload();
    }
  }

  apagarPagina(pagina: Page) {
    const index = this.pagesList.findIndex(p => p.url === pagina.url);
    if (index !== -1) {
      this.pagesList.splice(index, 1)
    }
  }

  calcularIndicadoresAcessibilidade() {

    // Reseta os valores das variaveis
    this.totalPagesEvaluated = 0;
    this.pagesWithErrors = 0;
    this.pagesWithLevelAErrors = 0;
    this.pagesWithLevelAaErrors = 0;
    this.pagesWithLevelAaaErrors = 0;
    this.commonAccessibilityErrors = [];
    this.errosList = {};

    for (const page of this.pagesList) {
      if (String(page.estado) === "Conforme" || String(page.estado) === "Não conforme") {
        this.totalPagesEvaluated += 1;

        const evaluation: Evaluation = page.evaluation;

        if (evaluation.tem_erro_A)
          this.pagesWithLevelAErrors += 1;
        if (evaluation.tem_erro_AA)
          this.pagesWithLevelAaErrors += 1;
        if (evaluation.tem_erro_AAA)
          this.pagesWithLevelAaaErrors += 1;


        if (evaluation.tem_erro_A || evaluation.tem_erro_AA || evaluation.tem_erro_AAA) {
          this.pagesWithErrors += 1;

          for (const erro in evaluation.erros) {

            if (Object.hasOwnProperty.call(evaluation.erros, erro)) {
              let value = evaluation.erros[erro];
              if (this.errosList[erro])
                this.errosList[erro] += value;
              else
                this.errosList[erro] = value;
            }
          }
        }
      }
    }
    let entries: [string, number][] = Object.entries(this.errosList);

    entries.sort((a, b) => b[1] - a[1]);

    this.commonAccessibilityErrors = entries.slice(0, 10).map(entry => entry[0]);
  }

  public gerarRelatorioHTML() : void {

    let relatorio = document.getElementById("relatorio")?.innerHTML;
    if (!relatorio) {
      alert('No content found to export.');
      return;
    }

    // Create a Blob containing the HTML content
    const blob = new Blob([relatorio], { type: 'text/html' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an anchor element
    const a = document.createElement('a');
    a.href = url;

    // Set the filename
    a.download = 'Relatorio-acessibilidade' + this.website?.url + '.html';

    // Programmatically trigger a click event on the anchor element
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public gerarRelatorioPDF() : void {
    
    let data = document.getElementById('relatorio'); 
    data?.removeAttribute("hidden"); 
    if (data) {
      html2canvas(data).then(canvas => {
        const contentDataURL = canvas.toDataURL('image/png')  // 'image/jpeg' for lower quality output.
        let pdf = new jsPDF('p', 'cm', 'a4'); //Generates PDF in portrait mode

        pdf.addImage(contentDataURL, 'PNG', 0, 0, 30.0, 9.5);  
        pdf.save('Relatorio-acessibilidade' + this.website?.url + '.pdf');   
      }); 
    }
    data?.setAttribute("hidden", "true");
  }
}