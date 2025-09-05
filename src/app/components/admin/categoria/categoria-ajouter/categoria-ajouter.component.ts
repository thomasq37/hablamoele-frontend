import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MenuComponent } from '../../menu/menu.component';
import { Categoria, createCategoria } from '../../../../models/categoria.model';
import {CategoriaService} from "../../../../services/categoria/categoria.service";

@Component({
  selector: 'app-categoria-ajouter',
  standalone: true,
  imports: [MenuComponent, ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './categoria-ajouter.component.html',
  styleUrl: './categoria-ajouter.component.scss'
})
export class CategoriaAjouterComponent {
  protected form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  protected isSubmitting = false;
  protected errorMessage = '';
  protected successMessage = '';

  // Même logique de menu que tes autres écrans admin admin-dashboard
  protected menuItems: { nom: string; url: string }[] = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Admin dashboard', url: '/admin-dashboard' },
    { nom: 'Lista de categorías', url: '/admin-categorias-listar' },
  ];

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private router: Router
  ) {}

  protected fieldInvalid(ctrl: string): boolean {
    const c = this.form.controls[ctrl];
    return c.invalid && (c.dirty || c.touched);
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const categoria: Categoria = createCategoria({
      nombre: this.form.value.nombre?.trim() || null
    });

    this.isSubmitting = true;
    try {
      await this.categoriaService.ajouterCategoria(categoria);
      // 1) soit on reste et on réinitialise le formulaire :
      //this.form.reset({ nombre: '' });
      //this.successMessage = 'Categoría creada con éxito.';

      // 2) si tu préfères rediriger :
      await this.router.navigate(['/admin-categorias-listar']);
    } catch (e: any) {
      this.errorMessage = e?.message || 'Error al crear la categoría';
    } finally {
      this.isSubmitting = false;
    }
  }
}
