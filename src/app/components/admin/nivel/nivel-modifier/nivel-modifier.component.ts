import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MenuComponent } from '../../menu/menu.component';
import { ActionBtnComponent } from '../../../action-btn/action-btn.component';
import { NivelService } from '../../../../services/nivel/nivel.service';
import { Nivel } from '../../../../models/nivel.model';

@Component({
  selector: 'app-nivel-modifier',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MenuComponent, ActionBtnComponent],
  templateUrl: './nivel-modifier.component.html',
  styleUrl: './nivel-modifier.component.scss'
})
export class NivelModifierComponent implements OnInit {
  nivelForm: FormGroup;
  nivelId = '';
  loading = true;
  errorMessage = '';

  menuItems = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Admin dashboard', url: '/admin-dashboard' },
    { nom: 'Administrar niveles', url: '/admin-niveles-listar' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private nivelService: NivelService
  ) {
    this.nivelForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    this.nivelId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.nivelId) {
      this.errorMessage = 'ID del nivel no válido.';
      this.loading = false;
      return;
    }
    this.chargerNivel();
  }

  private async chargerNivel(): Promise<void> {
    try {
      const n: Nivel = await this.nivelService.obtenirParIdNivel(parseInt(this.nivelId, 10));
      this.nivelForm.patchValue({ nombre: n?.nombre ?? '' });
    } catch (e: any) {
      this.errorMessage = e?.message || 'Error al cargar el nivel.';
    } finally {
      this.loading = false;
    }
  }

  fieldInvalid(ctrl: string): boolean {
    const c = this.nivelForm.controls[ctrl];
    return c.invalid && (c.dirty || c.touched);
  }

  async modifierNivel(): Promise<void> {
    if (this.nivelForm.invalid) {
      this.nivelForm.markAllAsTouched();
      this.errorMessage = 'Por favor completa los campos obligatorios.';
      return;
    }
    this.errorMessage = '';

    const payload: Nivel = {
      id: parseInt(this.nivelId, 10),
      nombre: this.nivelForm.value.nombre?.trim() || null,
    };

    try {
      await this.nivelService.modifierNivel(payload.id!, payload);
      await this.router.navigate(['/admin-niveles-listar']);
    } catch (e: any) {
      this.errorMessage = e?.message || 'Error al actualizar el nivel.';
    }
  }

  retournerALaListe(): void {
    this.router.navigate(['/admin-niveles-listar']);
  }
}
