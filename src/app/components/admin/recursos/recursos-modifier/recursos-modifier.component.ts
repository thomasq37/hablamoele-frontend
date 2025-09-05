import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MenuComponent } from '../../menu/menu.component';
import { ActionBtnComponent } from '../../../action-btn/action-btn.component';

import { RecursosService } from '../../../../services/recursos/recursos.service';
import { NivelService } from '../../../../services/nivel/nivel.service';

import { Categoria } from '../../../../models/categoria.model';
import { Nivel } from '../../../../models/nivel.model';
import {CategoriaService} from "../../../../services/categoria/categoria.service";

@Component({
  selector: 'app-recursos-modifier',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MenuComponent,
    ActionBtnComponent,
  ],
  templateUrl: './recursos-modifier.component.html',
  styleUrl: './recursos-modifier.component.scss',
})
export class RecursosModifierComponent implements OnInit, OnDestroy {
  errorMessage = '';
  recursosForm: FormGroup;
  private destroyed = false;
  private isBrowser = false;
  recursosId: string = '';
  loading = true;

  // Refs inputs fichiers
  @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('infografiasInput') infografiasInput!: ElementRef<HTMLInputElement>;

  // État local - données actuelles
  currentBanner: string = '';
  currentBannerUrl: string = '';

  // Infografías - liste unifiée (existantes + nouvelles)
  infografias: Array<{
    id?: string;
    name: string;
    base64?: string;
    file?: File;
    isNew: boolean;
    isDeleted?: boolean;
  }> = [];

  // État local - nouvelles données
  newBanner: string = '';
  newBannerFileName: string = '';

  // Indicateurs de modification
  bannerModified = false;

  // Référentiels
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
    private route: ActivatedRoute,
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
      categoriasIds: [[]], // multi-select (IDs)
      nivelesIds:   [[]],  // multi-select (IDs)
    });
  }

  ngOnInit(): void {
    this.recursosId = this.route.snapshot.paramMap.get('id') || '';
    // Charger référentiels d'abord (pour que la vue voie les options)
    this.chargerCategorias();
    this.chargerNiveles();
    // Puis charger le recurso
    if (this.recursosId) {
      this.chargerRecursos();
    } else {
      this.errorMessage = 'ID del recurso no válido.';
      this.loading = false;
    }
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
   *  Charger le recurso existant
   * ====================== */
  async chargerRecursos(): Promise<void> {
    try {
      const recurso: any = await this.recursosService.obtenirParIdRecursos(parseInt(this.recursosId, 10));

      if (recurso) {
        // Remplir le formulaire
        this.recursosForm.patchValue({
          titulo: recurso.titulo || '',
          description: recurso.description || '',
          tags: recurso.tags || '',
          // Pré-sélectionner catégories / niveaux si fournis par l'API
          categoriasIds: Array.isArray(recurso.categorias) ? recurso.categorias.map((c: any) => c.id) : [],
          nivelesIds: Array.isArray(recurso.niveles) ? recurso.niveles.map((n: any) => n.id) : [],
        });

        // Banner existant
        this.currentBanner = recurso.banner || '';
        this.currentBannerUrl = this.currentBanner ? `data:image/png;base64,${this.currentBanner}` : '';

        // Infografías existantes -> format unifié
        if (Array.isArray(recurso.infografias) && recurso.infografias.length > 0) {
          this.infografias = recurso.infografias.map((infografia: string, index: number) => ({
            id: `existing_${index}`,
            name: `Infografía ${index + 1}.pdf`,
            base64: infografia,
            isNew: false,
            isDeleted: false
          }));
        }

        this.loading = false;
      } else {
        this.errorMessage = 'Recurso no encontrado.';
        this.loading = false;
      }
    } catch (error: any) {
      this.errorMessage = error?.message || 'Error al cargar el recurso.';
      this.loading = false;
    }
  }

  /* ======================
   *  Banner
   * ====================== */
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
      this.newBanner = clean;
      this.newBannerFileName = selected.name;
      this.bannerModified = true;
      this.errorMessage = '';
    } catch {
      if (!this.destroyed) this.errorMessage = 'Error al leer el archivo PNG.';
    }
  }

  supprimerNouveauBanner(): void {
    this.newBanner = '';
    this.newBannerFileName = '';
    this.bannerModified = false;
    if (this.bannerInput?.nativeElement) this.bannerInput.nativeElement.value = '';
  }

  /* ======================
   *  Infografías (PDF)
   * ====================== */
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
      for (const file of pdfFiles) {
        this.infografias.push({
          name: file.name,
          file,
          isNew: true,
          isDeleted: false
        });
      }
      this.errorMessage = '';
      input.value = '';
    } catch {
      if (!this.destroyed) this.errorMessage = 'Error al procesar los archivos PDF.';
    }
  }

  supprimerInfografia(index: number): void {
    if (index >= 0 && index < this.infografias.length) {
      const inf = this.infografias[index];
      if (inf.isNew) this.infografias.splice(index, 1);
      else this.infografias[index].isDeleted = true;
    }
  }

  restaurerInfografia(index: number): void {
    if (index >= 0 && index < this.infografias.length) {
      this.infografias[index].isDeleted = false;
    }
  }

  get infografiasVisibles() {
    return this.infografias.filter(inf => !inf.isDeleted);
  }

  get infografiasSupprimees() {
    return this.infografias.filter(inf => inf.isDeleted && !inf.isNew);
  }

  /* ======================
   *  Submit
   * ====================== */
  async modifierRecursos(): Promise<void> {
    if (this.destroyed || this.recursosForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    try {
      const payload = await this.preparePayload(this.recursosForm.value);
      await this.recursosService.modifierRecursos(parseInt(this.recursosId, 10), payload as any);
      await this.router.navigate(['/admin-recursos-listar']);
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Error desconocido durante la actualización.';
    }
  }

  /* Construire payload final pour le back */
  private async preparePayload(formValue: any) {
    const payload: any = {
      titulo: formValue.titulo,
      description: formValue.description,
      tags: formValue.tags,
    };

    // Banner
    payload.banner = (this.bannerModified && this.newBanner) ? this.newBanner : this.currentBanner;

    // Infografías
    const infografias: string[] = [];
    for (const inf of this.infografias) {
      if (!inf.isDeleted) {
        if (inf.isNew && inf.file) {
          const dataUrl = await this.fileToBase64(inf.file);
          const clean = dataUrl.replace(/^data:[^;]+;base64,/, '');
          infografias.push(clean);
        } else if (!inf.isNew && inf.base64) {
          infografias.push(inf.base64);
        }
      }
    }
    payload.infografias = infografias;

    // Categorías / Niveles (IDs du select multiple -> number[])
    const categoriasIds: number[] = (formValue.categoriasIds || []).map((v: string | number) => +v);
    const nivelesIds: number[] = (formValue.nivelesIds || []).map((v: string | number) => +v);

    // Mapper vers objets {id} (pratique pour ManyToMany JPA)
    payload.categorias = categoriasIds.map(id => ({ id }));
    payload.niveles   = nivelesIds.map(id => ({ id }));

    return payload;
  }

  /* Utils */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }

  retournerALaListe(): void {
    this.router.navigate(['/admin-recursos-listar']);
  }
}
