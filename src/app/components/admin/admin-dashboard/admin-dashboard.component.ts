import { Component } from '@angular/core';
import {MenuComponent} from "../menu/menu.component";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    MenuComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  menuItems: {nom: string, url: string }[] = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Administrar recursos', url: '/admin-recursos-listar' },
    { nom: 'Administrar categorias', url: '/admin-categorias-listar' },
    { nom: 'Administrar niveles', url: '/admin-niveles-listar' },
    { nom: 'Estadísticas', url: '/admin-estadisticas' },
    { nom: 'Newsletter', url: '/admin-newsletter' },


  ];
}
