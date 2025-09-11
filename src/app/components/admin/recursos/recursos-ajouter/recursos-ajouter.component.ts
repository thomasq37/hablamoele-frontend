import { Component, ElementRef, ViewChild, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser, NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { MenuComponent } from '../../menu/menu.component';
import { ActionBtnComponent } from '../../../action-btn/action-btn.component';

import { RecursosService } from '../../../../services/recursos/recursos.service';
import { NivelService } from '../../../../services/nivel/nivel.service';

import { Categoria } from '../../../../models/categoria.model';
import { Nivel } from '../../../../models/nivel.model';
import {CategoriaService} from "../../../../services/categoria/categoria.service";

@Component({
  selector: 'app-recursos-ajouter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    MenuComponent,
    ActionBtnComponent,
  ],
  templateUrl: './recursos-ajouter.component.html',
  styleUrls: ['./recursos-ajouter.component.scss']
})
export class RecursosAjouterComponent implements OnInit {
  errorMessage = '';
  recursosForm: FormGroup;
  private destroyed = false;
  private isBrowser = false;

  // Refs inputs fichiers
  @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('infografiasInput') infografiasInput!: ElementRef<HTMLInputElement>;

  // État local fichiers
  banner: string = '';
  bannerFileName: string = '';
  infografiaFiles: File[] = [];
  infografiaFileNames: string[] = [];

  // Sélecteurs catégories / niveaux
  categoriasDisponibles: Categoria[] = [];
  categoriasLoading = false;
  categoriasError = '';

  nivelesDisponibles: Nivel[] = [];
  nivelesLoading = false;
  nivelesError = '';

  menuItems = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Admin dashboard', url: '/admin-dashboard' },
    { nom: 'Administrar recursos', url: '/admin-recursos-listar' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private recursosService: RecursosService,
    private categoriaService: CategoriaService,
    private nivelService: NivelService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.recursosForm = this.fb.group({
      titulo: ['', Validators.required],
      description: ['', Validators.required],
      tags: ['', Validators.required],
      categoriasIds: [[]], // multi-select => tableau d'IDs (string) que l'on convertira en number
      nivelesIds: [[]],
      nbInfografias: [0, Validators.required],
      nbCahiersActivite: [0, Validators.required],// idem
    });
  }

  ngOnInit(): void {
    this.chargerCategorias();
    this.chargerNiveles();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }

  /* ======================
   *  Chargement référentiels
   * ====================== */
  private async chargerCategorias(): Promise<void> {
    this.categoriasLoading = true;
    this.categoriasError = '';
    try {
      this.categoriasDisponibles = await this.categoriaService.listerCategorias();
    } catch (e: any) {
      console.error(e);
      this.categoriasError = e?.message || 'Error al cargar las categorías';
    } finally {
      this.categoriasLoading = false;
    }
  }

  private async chargerNiveles(): Promise<void> {
    this.nivelesLoading = true;
    this.nivelesError = '';
    try {
      this.nivelesDisponibles = await this.nivelService.listerNiveles();
    } catch (e: any) {
      console.error(e);
      this.nivelesError = e?.message || 'Error al cargar los niveles';
    } finally {
      this.nivelesLoading = false;
    }
  }

  trackByCatId = (_: number, c: Categoria) => c.id;
  trackByNivelId = (_: number, n: Nivel) => n.id;

  /* ======================
   *  Gestion fichiers
   * ====================== */

  /** Banner PNG */
  async onBannerChange(event: Event): Promise<void> {
    if (this.destroyed || !this.isBrowser) return;

    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/png')) {
      this.errorMessage = 'El banner debe ser un archivo PNG.';
      input.value = '';
      return;
    }

    try {
      const dataUrl = await this.fileToBase64(selected);
      const clean = dataUrl.replace(/^data:[^;]+;base64,/, '');
      this.banner = clean;
      this.bannerFileName = selected.name;
      this.errorMessage = '';
    } catch {
      if (!this.destroyed) {
        this.errorMessage = 'Error al leer el archivo PNG.';
      }
    }
  }

  /** Supprimer le banner */
  supprimerBanner(): void {
    this.banner = '';
    this.bannerFileName = '';
    if (this.bannerInput?.nativeElement) {
      this.bannerInput.nativeElement.value = '';
    }
  }

  /** Infografías PDF */
  async onInfografiasChange(event: Event): Promise<void> {
    if (this.destroyed || !this.isBrowser) return;

    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    if (files.length === 0) return;

    const pdfFiles = files.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length !== files.length) {
      this.errorMessage = 'Solo se permiten archivos PDF para las infografías.';
      input.value = '';
      return;
    }

    try {
      this.infografiaFiles = pdfFiles;
      this.infografiaFileNames = pdfFiles.map(file => file.name);
      this.errorMessage = '';
    } catch {
      if (!this.destroyed) {
        this.errorMessage = 'Error al procesar los archivos PDF.';
      }
    }
  }

  /** Supprimer une infographie spécifique */
  supprimerInfografia(index: number): void {
    if (index >= 0 && index < this.infografiaFiles.length) {
      this.infografiaFiles.splice(index, 1);
      this.infografiaFileNames.splice(index, 1);

      // Si plus de fichiers, reset l'input
      if (this.infografiaFiles.length === 0 && this.infografiasInput?.nativeElement) {
        this.infografiasInput.nativeElement.value = '';
      }
    }
  }

  /** Supprimer toutes les infographies */
  supprimerInfografias(): void {
    this.infografiaFiles = [];
    this.infografiaFileNames = [];
    if (this.infografiasInput?.nativeElement) {
      this.infografiasInput.nativeElement.value = '';
    }
  }

  /* ======================
   *  Soumission
   * ====================== */

  async ajouterRecursos(): Promise<void> {
    if (this.destroyed || this.recursosForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    if (!this.banner) {
      this.errorMessage = 'Por favor selecciona un banner PNG.';
      return;
    }

    if (this.infografiaFiles.length === 0) {
      this.errorMessage = 'Por favor selecciona al menos una infografía PDF.';
      return;
    }

    try {
      const payload = await this.preparePayload(this.recursosForm.value);
      await this.recursosService.ajouterRecursos(payload as any);
      await this.router.navigate(['/admin-recursos-listar']);
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Error desconocido durante el guardado.';
    }
  }

  /** Préparer le payload pour le back */
  private async preparePayload(formValue: any) {
    // Convertir les infographies PDF en base64
    const infografias: string[] = [];
    for (const file of this.infografiaFiles) {
      const dataUrl = await this.fileToBase64(file);
      const clean = dataUrl.replace(/^data:[^;]+;base64,/, '');
      infografias.push(clean);
    }

    // Récupérer les IDs sélectionnés (valeurs de <select multiple> → strings) et convertir en number
    const categoriasIds: number[] = (formValue.categoriasIds || []).map((v: string | number) => +v);
    const nivelesIds: number[] = (formValue.nivelesIds || []).map((v: string | number) => +v);

    // Construire les tableaux d'objets { id } attendus par le back (ManyToMany)
    const categorias = categoriasIds.map(id => ({ id }));
    const niveles = nivelesIds.map(id => ({ id }));

    return {
      titulo: formValue.titulo,
      description: formValue.description,
      tags: formValue.tags,
      banner: this.banner,
      infografias,
      categorias,
      niveles,
      nbInfografias: formValue.nbInfografias,
      nbCahiersActivite: formValue.nbCahiersActivite
    };
  }

  /** Utilitaire pour convertir un fichier en base64 */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }
}
