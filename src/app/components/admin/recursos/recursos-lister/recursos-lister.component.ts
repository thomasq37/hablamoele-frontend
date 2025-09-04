import {Component, OnInit} from '@angular/core';
import {MenuComponent} from "../../menu/menu.component";
import {Recursos} from "../../../../models/recursos.model";
import {RecursosService} from "../../../../services/recursos/recursos.service";
import {NgForOf} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-recursos-lister',
  standalone: true,
  imports: [
    MenuComponent,
    NgForOf,
    RouterLink
  ],
  templateUrl: './recursos-lister.component.html',
  styleUrl: './recursos-lister.component.scss'
})
export class RecursosListerComponent implements OnInit {
  protected recursos: Recursos[] = [];
  protected tags: string[] = [];
  menuItems: { nom: string; url: string }[] = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Añadir recursos', url: '/admin-recursos-añadir' },
  ];
  constructor(private recursosService: RecursosService) { }
  ngOnInit(): void {
    this.recursosService.listerRecursos().then(recursos => {
      this.recursos = recursos;
    })
  }

  supprimerInfographie(id: number | undefined) {
    this.recursosService.supprimerRecursos(id)
      .then(() => {
        this.recursos = this.recursos.filter(r => r.id !== id);
      })
      .catch(err => {
        console.error('Erreur lors de la suppression', err);
        alert('Impossible de supprimer cette ressource.');
      });
  }

}
