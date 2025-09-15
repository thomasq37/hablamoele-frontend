import {Component, OnInit} from '@angular/core';
import {MenuComponent} from "../../menu/menu.component";
import {RecursosService} from "../../../../services/recursos/recursos.service";
import {NgForOf, NgIf, DatePipe} from "@angular/common";
import {RecursosVisualisacionDTO} from "../../../../models/recursos-visualisacion-dto.model";

// Interface pour les données groupées
interface RecursoVisualisacionGroup {
  recursosId: number;
  recursosTitulo: string;
  totalVisualisations: number;
  derniereVisualisacion: Date;
  visualisations: RecursosVisualisacionDTO[];
  showDetails?: boolean
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    MenuComponent,
    NgForOf,
    NgIf,
    DatePipe
  ],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export class EstadisticasComponent implements OnInit {

  menuItems: { nom: string; url: string }[] = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Admin dashboard', url: '/admin-dashboard' },
  ];

  recursosVisualisacionDTO: RecursosVisualisacionDTO[] = [];
  recursosGroupes: RecursoVisualisacionGroup[] = [];
  totalVisualisations = 0;

  constructor(private recursosService: RecursosService) {}

  ngOnInit(): void {
    this.recursosService.obtenirToutesVisualisations().then(response => {
      this.recursosVisualisacionDTO = response;
      // Grouper et traiter les données
      this.grouperParRecurso();
      this.calculerTotalVisualisations();
    });
  }

  private grouperParRecurso(): void {
    // Grouper les visualisations par recursosId
    const groupes = new Map<number, RecursosVisualisacionDTO[]>();

    this.recursosVisualisacionDTO.forEach(visualisation => {
      const recursosId = visualisation.recursosId;

      if (!groupes.has(recursosId)) {
        groupes.set(recursosId, []);
      }

      groupes.get(recursosId)!.push(visualisation);
    });

    // Convertir en array avec données agrégées
    this.recursosGroupes = Array.from(groupes.entries()).map(([recursosId, visualisations]) => {
      // Trier les visualisations par date (plus récentes en premier)
      const visualisationsTriees = visualisations.sort((a, b) =>
        new Date(b.dateVisualisacion).getTime() - new Date(a.dateVisualisacion).getTime()
      );

      return {
        recursosId,
        recursosTitulo: visualisations[0].recursosTitulo, // Même titre pour toutes
        totalVisualisations: visualisations.length,
        derniereVisualisacion: this.addHours(new Date(visualisationsTriees[0].dateVisualisacion), +2),
        visualisations: visualisationsTriees.map(v => ({
          ...v,
          dateVisualisacion: this.addHours(new Date(v.dateVisualisacion), +2).toISOString() // 👈 retourne un string
        }))
      };
    });


    // Trier les groupes par dernière visualisation (plus récents en premier)
    this.recursosGroupes.sort((a, b) =>
      b.derniereVisualisacion.getTime() - a.derniereVisualisacion.getTime()
    );
  }

  // TODO corriger backend et db
  private addHours(date: Date, hours: number): Date {
    const d = new Date(date);
    d.setHours(d.getHours() + hours);
    return d;
  }


  private calculerTotalVisualisations(): void {
    this.totalVisualisations = this.recursosVisualisacionDTO.length;
  }

  // Méthodes utilitaires pour le template
  getVisualisationsAujourdhui(): number {
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    return this.recursosVisualisacionDTO.filter(v => {
      const dateVisu = new Date(v.dateVisualisacion);
      dateVisu.setHours(0, 0, 0, 0);
      return dateVisu.getTime() === aujourdhui.getTime();
    }).length;
  }

  getVisualisationsAujordhuiParRecurso(groupe: RecursoVisualisacionGroup): number {
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    return groupe.visualisations.filter(v => {
      const dateVisu = new Date(v.dateVisualisacion);
      dateVisu.setHours(0, 0, 0, 0);
      return dateVisu.getTime() === aujourdhui.getTime();
    }).length;
  }
  getTotalIPsDistinctes(): number {
    const ipsUniques = new Set(this.recursosVisualisacionDTO.map(v => v.ip));
    return ipsUniques.size;
  }
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  // Méthode pour afficher/masquer les détails
  toggleDetails(groupe: RecursoVisualisacionGroup): void {
    // Vous pouvez ajouter une propriété showDetails si nécessaire
    groupe.showDetails = !groupe.showDetails;
  }
}
