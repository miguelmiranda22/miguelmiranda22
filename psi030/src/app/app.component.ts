import { Component } from '@angular/core';
import { WebsiteService } from './website.service';

//exemplos de imports de elementos de design da Google @ https://material-web.dev/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'psi030';
  WebsiteService: WebsiteService; // Declare the property

  constructor(private websiteService: WebsiteService) {
    this.WebsiteService = websiteService; // Initialize it with the injected service
  }
}
