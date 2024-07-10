import { Component, OnInit, ViewChild } from '@angular/core';
import { Website, EstadosWebsite } from '../website';
import { WebsiteService } from '../website.service';
import {MdDialog} from '@material/web/dialog/dialog.js';
import { Page } from '../page';

import '@material/web/textfield/outlined-text-field'
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/list/list-item.js';
import '@material/web/checkbox/checkbox.js'
import '@material/web/dialog/dialog.js'



@Component({
  selector: 'app-websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.css']
})

export class WebsitesComponent implements OnInit{


@ViewChild('websiteUrl') websiteUrl: any;


public websitesList: Website[] = [];
public addResult: boolean = true;
public listaFiltrada: Website[] = [];
public filtrada: boolean = false;
public ascendenteRegisto = true;
public ascendenteAval = true;
public selectedOrdenar: boolean = true;
public currentWebsite: Website | undefined;
public currentPagesList: Page[] = [];
public dialog: MdDialog | undefined;
public selectedPages: Page[] = [];
public selectedFilters: string[] = [];

// para o html ter acesso ao tipo EstadosWebsite
public estados: string[] = Object.values(EstadosWebsite).map(value => String(value));


constructor(private websiteService: WebsiteService) { }

ngOnInit(): void {
  this.getWebsites();
}

getWebsites(): void {
  this.websiteService
    .getWebsites()
    .subscribe(websites => this.websitesList = websites);
}

add(url: string): void {
  
  let patt= new RegExp(/^(http|https):\/\/[^ \/]+(\.[^ \/]{2,})+(\/.*)?$/);
  let trimmed_url = url.trim();

  if(patt.test(trimmed_url) && !(trimmed_url.charAt(trimmed_url.length - 1) === '/')){
    this.websiteUrl.nativeElement.value = '';
    this.addResult = true;
    url = encodeURIComponent(url);
    if (!url) { return; }
    this.websiteService.addWebsite( { url , estado: EstadosWebsite['Por avaliar'] } as Website )
      .subscribe(website => {
        this.websitesList.push(website);
        this.ordenar();
      });

  }
  else {
    this.addResult = false;
  }
}

deleteWebsite(website: Website, event: Event): void {

  event.stopPropagation();
  let url : string = encodeURIComponent(website.url);

  if (website.pages.length > 0) {
    const confirmar = confirm("Apagar website e todas as páginas associadas?");

    if (confirmar) {
      website.pages = [];
      this.websiteService.deleteWebsite({url} as Website)
        .subscribe(web => {
          this.websitesList = this.websitesList.filter(w => w !== website);
        });
      return;
    }
    return;
  }
  this.websiteService.deleteWebsite({url} as Website)
  .subscribe(web => {
    this.websitesList = this.websitesList.filter(w => w !== website);
  });

  return;
}

getPages(): void {
  if(this.currentWebsite){
    let url = encodeURIComponent(this.currentWebsite.url)
  this.websiteService.getPages(url)
  .subscribe(pages => this.currentPagesList = pages);
  }
}

public iniciarAvaliacao(event: Event, website: Website): void{
  this.currentWebsite = website;
  event.stopPropagation();
  this.getPages();
  this.dialog = document.getElementById("my-dialog") as MdDialog;
  this.dialog.show();
}

toggleSelection(page: Page): void {
  const index = this.selectedPages.indexOf(page);
  if (index > -1) {
    this.selectedPages.splice(index, 1);
  } else {
    this.selectedPages.push(page);
  }
}

isSelected(page: Page): boolean {
  return this.selectedPages.includes(page);
}

cancel(): void{
  this.selectedPages = [];
}

submitPages():void {

  let pageListEncoded: Object[] = []

  this.selectedPages.forEach(page => {
    let pageEncoded = {...page}
    pageEncoded.url = encodeURIComponent(pageEncoded.url)
    pageListEncoded.push({ url: pageEncoded.url })
  });

  if(this.currentWebsite){
    let encondedUrl = encodeURIComponent(this.currentWebsite.url)
    this.websiteService.evaluateWebsite(encondedUrl, pageListEncoded).subscribe(p => this.getPages());
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  return;
  }
}

closeDialog():void {
  // Pass selected pages back to parent component (if needed)
  this.dialog?.close();
}

public onUrlChange(event: KeyboardEvent): void {
  this.addResult = true;
}

public ordenar(): void{
  if(this.selectedOrdenar){
    this.ordenaDataRegisto(false);
  }
  else{
    this.ordenaDataUltAval(false);
  }
}

public ordenaDataRegisto(reorder: boolean): void {

  this.selectedOrdenar = true;

  if(reorder){
     this.ascendenteRegisto = !this.ascendenteRegisto; 
  }
    
  if(this.filtrada){
    this.listaFiltrada.sort((a, b) => {
      return this.ascendenteRegisto
        ? new Date(a.dataRegisto).getTime() - new Date(b.dataRegisto).getTime()
        : new Date(b.dataRegisto).getTime() - new Date(a.dataRegisto).getTime();
    });
  }else{
    this.websitesList.sort((a, b) => {
      return this.ascendenteRegisto
        ? new Date(a.dataRegisto).getTime() - new Date(b.dataRegisto).getTime()
        : new Date(b.dataRegisto).getTime() - new Date(a.dataRegisto).getTime();
    });
  }
}

public ordenaDataUltAval(reorder: boolean): void{

  this.selectedOrdenar = false;

  if(reorder){
    this.ascendenteAval = !this.ascendenteAval; 
 }

  if(this.filtrada){
    this.listaFiltrada.sort((a, b) => {
      return this.ascendenteAval
        ? new Date(a.dataAval).getTime() - new Date(b.dataAval).getTime()
        : new Date(b.dataAval).getTime() - new Date(a.dataAval).getTime();
    });
  }else{
    this.websitesList.sort((a, b) => {
      return this.ascendenteAval
        ? new Date(a.dataAval).getTime() - new Date(b.dataAval).getTime()
        : new Date(b.dataAval).getTime() - new Date(a.dataAval).getTime();
    });
  }
}

public toggleFilter(filter: string): void {
  const index = this.selectedFilters.indexOf(filter);
  if (index === -1) {
    this.selectedFilters.push(filter); // Add filter if not already selected
  } else {
    this.selectedFilters.splice(index, 1); // Remove filter if already selected
  }
  this.filterWebsites(); // Apply filters to the list
}

public filterWebsites(): void {
  if (this.selectedFilters.length > 0) {
    this.filtrada = true;
    this.listaFiltrada = this.websitesList.filter(website =>
      this.selectedFilters.includes(website.estado.toString())
    );
  } else {
    this.filtrada = false;
    this.listaFiltrada = this.websitesList; // Show all websites if no filters selected
  }
}

public formataData(inputDate: Date): string {
  if(inputDate != null){
    const dateWithHour = new Date(inputDate);
    let stringDate = inputDate.toString();
    stringDate = stringDate.slice(stringDate.indexOf('T') + 1)

    dateWithHour.setHours(Number(stringDate.slice(0,2)) + 1, Number(stringDate.slice(3,5)))
    dateWithHour.setSeconds(Number(stringDate.slice(6,8)));

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


}
