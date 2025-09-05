import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MenuComponent } from '../../menu/menu.component';
import { Categoria } from '../../../../models/categoria.model';
import {CategoriaService} from "../../../../services/categoria/categoria.service";

@Component({
  selector: 'app-categoria-lister',
  standalone: true,
  imports: [MenuComponent, NgForOf, NgIf, RouterLink],
  templateUrl: './categoria-lister.component.html',
  styleUrl: './categoria-lister.component.scss'
})
export class CategoriaListerComponent implements OnInit {
  protected categorias: Categoria[] = [];
  protected errorMessage = '';
  private isBrowser = false;

  menuItems: { nom: string; url: string }[] = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Admin dashboard', url: '/admin-dashboard' },
    { nom: 'Añadir categoría', url: '/admin-categorias-añadir' },
  ];

  constructor(private categoriaService: CategoriaService, @Inject(PLATFORM_ID) platformId: Object,) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.categoriaService.listerCategorias()
      .then(cats => this.categorias = cats)
      .catch(err => {
        console.error(err);
        this.errorMessage = 'Error al cargar las categorías';
      });
  }

  trackById = (_: number, item: Categoria) => item.id;

  supprimerCategoria(id: number | undefined) {
    if (!id) return;
    const ok = confirm('¿Eliminar esta categoría?');
    if (!ok) return;

    this.categoriaService.supprimerCategoria(id)
      .then(() => {
        this.categorias = this.categorias.filter(c => c.id !== id);
      })
      .catch(err => {
        console.error('Erreur lors de la suppression', err);
        alert('No se puede eliminar esta categoría.');
      });
  }
}
