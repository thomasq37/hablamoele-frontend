import {Component, OnInit} from '@angular/core';
import {MenuComponent} from "../../menu/menu.component";
import {RecursosService} from "../../../../services/recursos/recursos.service";
import {RecursosStatistiquesDTO} from "../../../../models/recursos-statistiques-dto.model";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    MenuComponent,
    NgForOf
  ],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export class EstadisticasComponent implements OnInit {

  menuItems: { nom: string; url: string }[] = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Admin dashboard', url: '/admin-dashboard' },
  ];
  recursosDTO: RecursosStatistiquesDTO[] = [];

  constructor(private recursosService: RecursosService) {
  }

  ngOnInit(): void {
    this.recursosService.listerStatsRecursos().then(response => {
      this.recursosDTO = response;
    })
  }
}
