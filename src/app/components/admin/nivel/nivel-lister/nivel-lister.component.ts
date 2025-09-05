import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MenuComponent } from '../../menu/menu.component';
import { Nivel } from '../../../../models/nivel.model';
import { NivelService } from '../../../../services/nivel/nivel.service'; // <-- service singular

@Component({
  selector: 'app-nivel-lister',
  standalone: true,
  imports: [MenuComponent, NgForOf, NgIf, RouterLink],
  templateUrl: './nivel-lister.component.html',
  styleUrl: './nivel-lister.component.scss'
})
export class NivelListerComponent implements OnInit {
  protected niveles: Nivel[] = [];
  protected errorMessage = '';
  private isBrowser = false;

  menuItems: { nom: string; url: string }[] = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Admin dashboard', url: '/admin-dashboard' },
    { nom: 'Añadir nivel', url: '/admin-niveles-añadir' },
  ];

  constructor(private nivelService: NivelService, @Inject(PLATFORM_ID) platformId: Object) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.nivelService.listerNiveles()
      .then(ns => this.niveles = ns)
      .catch(err => {
        console.error(err);
        this.errorMessage = 'Error al cargar los niveles';
      });
  }

  trackById = (_: number, item: Nivel) => item.id;

  supprimerNivel(id: number | undefined) {
    if (!id) return;
    const ok = confirm('¿Eliminar este nivel?');
    if (!ok) return;

    this.nivelService.supprimerNivel(id)
      .then(() => this.niveles = this.niveles.filter(n => n.id !== id))
      .catch(err => {
        console.error('Erreur lors de la suppression', err);
        alert('No se puede eliminar este nivel.');
      });
  }
}
