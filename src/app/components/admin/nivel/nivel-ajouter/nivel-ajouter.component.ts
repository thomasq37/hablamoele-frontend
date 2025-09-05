import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MenuComponent } from '../../menu/menu.component';
import { Nivel, createNivel } from '../../../../models/nivel.model';
import {NivelService} from "../../../../services/nivel/nivel.service";

@Component({
  selector: 'app-nivel-ajouter',
  standalone: true,
  imports: [MenuComponent, ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './nivel-ajouter.component.html',
  styleUrl: './nivel-ajouter.component.scss'
})
export class NivelAjouterComponent {
  protected form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  protected isSubmitting = false;
  protected errorMessage = '';
  protected successMessage = '';

  protected menuItems: { nom: string; url: string }[] = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Admin dashboard', url: '/admin-dashboard' },
    { nom: 'Lista de niveles', url: '/admin-niveles-listar' },
  ];

  constructor(
    private fb: FormBuilder,
    private nivelService: NivelService,
    private router: Router
  ) {}

  fieldInvalid(ctrl: string): boolean {
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

    const nivel: Nivel = createNivel({
      nombre: this.form.value.nombre?.trim() || null
    });

    this.isSubmitting = true;
    try {
      await this.nivelService.ajouterNivel(nivel);
      await this.router.navigate(['/admin-niveles-listar']);
    } catch (e: any) {
      this.errorMessage = e?.message || 'Error al crear el nivel';
    } finally {
      this.isSubmitting = false;
    }
  }
}
