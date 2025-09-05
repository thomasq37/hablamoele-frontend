import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MenuComponent } from '../../menu/menu.component';
import { ActionBtnComponent } from '../../../action-btn/action-btn.component';
import { Categoria } from '../../../../models/categoria.model';
import {CategoriaService} from "../../../../services/categoria/categoria.service";

@Component({
  selector: 'app-categoria-modifier',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MenuComponent, ActionBtnComponent],
  templateUrl: './categoria-modifier.component.html',
  styleUrl: './categoria-modifier.component.scss'
})
export class CategoriaModifierComponent implements OnInit {
  categoriaForm: FormGroup;
  categoriaId = '';
  loading = true;
  errorMessage = '';

  menuItems = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Admin dashboard', url: '/admin-dashboard' },
    { nom: 'Administrar categorías', url: '/admin-categorias-listar' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoriaService: CategoriaService
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    this.categoriaId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.categoriaId) {
      this.errorMessage = 'ID de la categoría no válido.';
      this.loading = false;
      return;
    }
    this.chargerCategoria();
  }

  private async chargerCategoria(): Promise<void> {
    try {
      const cat: Categoria = await this.categoriaService.obtenirParIdCategoria(parseInt(this.categoriaId, 10));
      this.categoriaForm.patchValue({ nombre: cat?.nombre ?? '' });
    } catch (e: any) {
      this.errorMessage = e?.message || 'Error al cargar la categoría.';
    } finally {
      this.loading = false;
    }
  }

  fieldInvalid(ctrl: string): boolean {
    const c = this.categoriaForm.controls[ctrl];
    return c.invalid && (c.dirty || c.touched);
  }

  async modifierCategoria(): Promise<void> {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      this.errorMessage = 'Por favor completa los campos obligatorios.';
      return;
    }
    this.errorMessage = '';

    const payload: Categoria = {
      id: parseInt(this.categoriaId, 10),
      nombre: this.categoriaForm.value.nombre?.trim() || null,
    };

    try {
      await this.categoriaService.modifierCategoria(payload.id!, payload);
      await this.router.navigate(['/admin-categorias-listar']);
    } catch (e: any) {
      this.errorMessage = e?.message || 'Error al actualizar la categoría.';
    }
  }

  retournerALaListe(): void {
    this.router.navigate(['/admin-categorias-listar']);
  }
}
