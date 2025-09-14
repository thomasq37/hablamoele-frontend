import { Component } from '@angular/core';
import {MenuComponent} from "../menu/menu.component";
import {NewsletterListeComponent} from "./newsletter-liste/newsletter-liste.component";

@Component({
  selector: 'app-newsletter-dashboard',
  standalone: true,
  imports: [
    MenuComponent,
    NewsletterListeComponent
  ],
  templateUrl: './newsletter-dashboard.component.html',
  styleUrl: './newsletter-dashboard.component.scss'
})
export class NewsletterDashboardComponent {
  menuItems: { nom: string; url: string }[] = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Admin dashboard', url: '/admin-dashboard' },
  ];
}
