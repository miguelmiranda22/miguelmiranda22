import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WebsitesComponent } from './websites/websites.component';
import { WebsiteDetailComponent } from './website-detail/website-detail.component';
import { PageEvaluationDetailsComponent } from './page-evaluation-details/page-evaluation-details.component';


const routes: Routes = [
  { path: 'websites', component: WebsitesComponent },
  { path: '', redirectTo: '/websites', pathMatch: 'full' },
  { path: 'website/:url', component: WebsiteDetailComponent },
  { path: 'evaluation/:url', component: PageEvaluationDetailsComponent },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
