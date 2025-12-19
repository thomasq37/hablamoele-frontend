import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MenuComponent } from '../../menu/menu.component';
import { ActionBtnComponent } from '../../../action-btn/action-btn.component';

import { RecursosService } from '../../../../services/recursos/recursos.service';
import { NivelService } from '../../../../services/nivel/nivel.service';
import { CategoriaService } from '../../../../services/categoria/categoria.service';
import { S3Service } from '../../../../services/S3/s3.service';

import { Categoria } from '../../../../models/categoria.model';
import { Nivel } from '../../../../models/nivel.model';

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

  // Titre original pour suppression des anciens fichiers
  private originalTitulo: string = '';

  @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('infografiasInput') infografiasInput!: ElementRef<HTMLInputElement>;

  // État local - données actuelles
  currentBannerUrl: string = '';

  // Infografías - liste unifiée
  infografias: Array<{
    id?: string;
    name: string;
    url?: string;
    file?: File;
    isNew: boolean;
    isDeleted?: boolean;
  }> = [];

  // Nouvelles données
  newBannerFile: File | null = null;
  newBannerFileName: string = '';
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
    private s3Service: S3Service,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.recursosForm = this.fb.group({
      titulo: ['', Validators.required],
      description: ['', Validators.required],
      tags: ['', Validators.required],
      categoriasIds: [[]],
      nivelesIds: [[]],
      nbInfografias: [0, Validators.required],
      nbCahiersActivite: [0, Validators.required],
    });
  }

  async ngOnInit(): Promise<void> {
    this.recursosId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.recursosId) {
      this.errorMessage = 'ID del recurso no válido.';
      this.loading = false;
      return;
    }

    try {
      await this.s3Service.initialize();
      await Promise.all([
        this.chargerCategorias(),
        this.chargerNiveles()
      ]);
      await this.chargerRecursos();

    } catch (error: any) {
      console.error('❌ Erreur initialisation:', error);
      this.errorMessage = error?.message || 'Error al cargar la configuración.';
      this.loading = false;
    }
  }
  ngOnDestroy(): void {
    this.destroyed = true;
  }

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

  async chargerRecursos(): Promise<void> {
    try {
      const recurso: any = await this.recursosService.obtenirParIdRecursos(parseInt(this.recursosId, 10));

      if (recurso) {
        // SAUVEGARDER LE TITRE ORIGINAL
        this.originalTitulo = recurso.titulo || '';

        this.recursosForm.patchValue({
          titulo: recurso.titulo || '',
          description: recurso.description || '',
          tags: recurso.tags || '',
          categoriasIds: Array.isArray(recurso.categorias) ? recurso.categorias.map((c: any) => c.id) : [],
          nivelesIds: Array.isArray(recurso.niveles) ? recurso.niveles.map((n: any) => n.id) : [],
          nbInfografias: recurso.nbInfografias ?? 0,
          nbCahiersActivite: recurso.nbCahiersActivite ?? 0,
        });

        // Banner existant
        this.currentBannerUrl = recurso.banner || '';

        // Infografías existantes
        if (Array.isArray(recurso.infografias) && recurso.infografias.length > 0) {
          this.infografias = recurso.infografias.map((url: string, index: number) => ({
            id: `existing_${index}`,
            name: `Infografía ${index + 1}.pdf`,
            url: url,
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

    this.newBannerFile = selected;
    this.newBannerFileName = selected.name;
    this.bannerModified = true;
    this.errorMessage = '';
  }

  supprimerNouveauBanner(): void {
    this.newBannerFile = null;
    this.newBannerFileName = '';
    this.bannerModified = false;
    if (this.bannerInput?.nativeElement) this.bannerInput.nativeElement.value = '';
  }

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

  private async preparePayload(formValue: any) {
    const newTitulo = formValue.titulo;

    const payload: any = {
      titulo: newTitulo,
      description: formValue.description,
      tags: formValue.tags,
      nbInfografias: formValue.nbInfografias,
      nbCahiersActivite: formValue.nbCahiersActivite
    };

    // Banner - supprimer l'ancien si modifié
    if (this.bannerModified && this.newBannerFile) {
      // Supprimer l'ancien banner
      if (this.currentBannerUrl) {
        try {
          await this.s3Service.deleteFileByUrl(this.currentBannerUrl);
        } catch (error) {
          console.warn('Impossible de supprimer l\'ancien banner:', error);
        }
      }

      // ✅ uploadFile() retourne déjà l'URL complète pour les banners
      const bannerUrl = await this.s3Service.uploadFile(this.newBannerFile, 'banners', newTitulo);
      payload.banner = bannerUrl; // ✅ URL complète directement
    } else {
      payload.banner = this.currentBannerUrl;
    }

    // Infografías - supprimer les anciennes marquées comme supprimées
    const urlsToDelete = this.infografias
      .filter(inf => inf.isDeleted && !inf.isNew && inf.url)
      .map(inf => inf.url!);

    if (urlsToDelete.length > 0) {
      try {
        await this.s3Service.deleteMultipleFiles(urlsToDelete);
      } catch (error) {
        console.warn('Impossible de supprimer certaines infografías:', error);
      }
    }

    // Uploader les nouvelles infografías
    const infografiasUrls: string[] = [];
    for (const inf of this.infografias) {
      if (!inf.isDeleted) {
        if (inf.isNew && inf.file) {
          // ✅ uploadFile() retourne la CLÉ S3 pour les infografías
          const key = await this.s3Service.uploadFile(inf.file, 'infografias', newTitulo);
          infografiasUrls.push(key); // ✅ Clé S3 directement
        } else if (!inf.isNew && inf.url) {
          infografiasUrls.push(inf.url);
        }
      }
    }
    payload.infografias = infografiasUrls;

    // Categorías / Niveles
    const categoriasIds: number[] = (formValue.categoriasIds || []).map((v: string | number) => +v);
    const nivelesIds: number[] = (formValue.nivelesIds || []).map((v: string | number) => +v);

    payload.categorias = categoriasIds.map(id => ({ id }));
    payload.niveles = nivelesIds.map(id => ({ id }));

    return payload;
  }

  retournerALaListe(): void {
    this.router.navigate(['/admin-recursos-listar']);
  }
}
