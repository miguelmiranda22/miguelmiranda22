import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Website } from './website';

import { Page } from './page';
import { Evaluation } from './evaluation';
import { Test } from './test';
import { Elemento } from './elemento';


@Injectable({ providedIn: 'root' })
export class WebsiteService {
  
  updateWebsite(website: Website) {
    throw new Error('Method not implemented.');
  }

  private websitesUrl = 'https://miguelmiranda22.onrender.com';  // URL to web api
  //private websitesUrl = 'http://appserver.alunos.di.fc.ul.pt:3080/';  // URL to web api


  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient){ }

    getWebsite(url: string) {
      const link = `${this.websitesUrl + "website"}/${url}`;
      return this.http.get<Website>(link).pipe(
        catchError(this.handleError<Website>(`getWebsite url=${url}`))
      );
    }

    /** GET websites from the server */
    getWebsites(): Observable<Website[]> {
      return this.http.get<Website[]>(this.websitesUrl + "websites")
        .pipe(
         catchError(this.handleError<Website[]>('getWebsites', []))
        );
    }

    /** POST: add a new website to the server */
    addWebsite(website: Website): Observable<Website> {
      return this.http.post<Website>(this.websitesUrl +"website", website, this.httpOptions).pipe(
        catchError(this.handleError<Website>('addWebsite'))
      );
    }

    deleteWebsite(website: Website): Observable<Website>{
      return this.http.post<Website>(this.websitesUrl + "website/delete", website, this.httpOptions).pipe(
        catchError(this.handleError<Website>('deleteWebsite'))
      );
    }

    /** GET pages from the website */
    getPages(url: string): Observable<Page[]> {
      return this.http.get<Page[]>(this.websitesUrl + "pages/" + url).pipe(
        catchError(this.handleError<Page[]>('getpages', []))
      );
    }

    /** POST: add a new website to the server */
    addPage(urlWebsite: string, page: Page): Observable<Page> {
      return this.http.post<Page>(this.websitesUrl +"page/" + urlWebsite, page, this.httpOptions).pipe(
        catchError(this.handleError<Page>('addPage'))
      );
    }

    deletePages(urlWebsite: string, pageList: Object[]): Observable<Page[]>{
      return this.http.post<Page[]>(this.websitesUrl + "pages/delete/" + urlWebsite, pageList, this.httpOptions).pipe(
        catchError(this.handleError<Page[]>('deletePages'))
      );
    }

    evaluateWebsite(urlWebsite: string, pageList: Object[]): Observable<Page[]>{
      return this.http.post<Page[]>(this.websitesUrl + "evaluation/" + urlWebsite, pageList, this.httpOptions).pipe(
        catchError(this.handleError<Page[]>("evaluateWebsite"))
      );
    }

    getPage(url: string) {
      const link = `${this.websitesUrl + "page"}/${url}`;
      return this.http.get<Page>(link).pipe(
        catchError(this.handleError<Page>(`getPage url=${url}`))
      );
    }

    getEvaluation(id: string) {
      const link = `${this.websitesUrl + "evaluation"}/${id}`;
      return this.http.get<Evaluation>(link).pipe(
        catchError(this.handleError<Evaluation>(`getEvaluation id=${id}`))
      );
    }

    getTests(id: string): Observable<Test[]> {
      return this.http.get<Test[]>(this.websitesUrl + "evaluation/tests/" + id).pipe(
        catchError(this.handleError<Test[]>('getTests', []))
      );
    }

    getElementos(id: string): Observable<Elemento[]> {
      return this.http.get<Elemento[]>(this.websitesUrl + "evaluation/elements/" + id).pipe(
        catchError(this.handleError<Elemento[]>('getElements', []))
      );
    }

    
      /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}