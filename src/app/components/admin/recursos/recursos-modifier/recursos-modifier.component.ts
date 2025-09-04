import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuComponent } from "../../menu/menu.component";
import { ActionBtnComponent } from "../../../action-btn/action-btn.component";
import { RecursosService } from "../../../../services/recursos/recursos.service";

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

  // Infographies - liste unifiée (existantes + nouvelles)
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

  menuItems = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Administrar recursos', url: '/admin-recursos-listar' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private recursosService: RecursosService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.recursosForm = this.fb.group({
      titulo: ['', Validators.required],
      description: ['', Validators.required],
      tags: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.recursosId = this.route.snapshot.paramMap.get('id') || '';
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

  /** Charger les données du recurso existant */
  async chargerRecursos(): Promise<void> {
    try {
      const recurso = await this.recursosService.obtenirParIdRecursos(parseInt(this.recursosId));

      if (recurso) {
        // Remplir le formulaire
        this.recursosForm.patchValue({
          titulo: recurso.titulo || '',
          description: recurso.description || '',
          tags: recurso.tags || ''
        });

        // Banner existant
        this.currentBanner = recurso.banner || '';
        if (this.currentBanner) {
          this.currentBannerUrl = `data:image/png;base64,${this.currentBanner}`;
        }

        // Infographies existantes - les transformer en format unifié
        if (recurso.infografias && recurso.infografias.length > 0) {
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

  /** Nouveau banner PNG */
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
      if (!this.destroyed) {
        this.errorMessage = 'Error al leer el archivo PNG.';
      }
    }
  }

  /** Supprimer le nouveau banner */
  supprimerNouveauBanner(): void {
    this.newBanner = '';
    this.newBannerFileName = '';
    this.bannerModified = false;
    if (this.bannerInput?.nativeElement) {
      this.bannerInput.nativeElement.value = '';
    }
  }

  /** Nouvelles infografías PDF - les ajouter à la liste */
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
      // Ajouter les nouveaux fichiers à la liste existante
      for (const file of pdfFiles) {
        this.infografias.push({
          name: file.name,
          file: file,
          isNew: true,
          isDeleted: false
        });
      }

      this.errorMessage = '';
      input.value = ''; // Reset input pour permettre de nouvelles sélections
    } catch {
      if (!this.destroyed) {
        this.errorMessage = 'Error al procesar los archivos PDF.';
      }
    }
  }

  /** Supprimer une infographie (existante ou nouvelle) */
  supprimerInfografia(index: number): void {
    if (index >= 0 && index < this.infografias.length) {
      const infografia = this.infografias[index];

      if (infografia.isNew) {
        // Supprimer complètement les nouvelles infographies
        this.infografias.splice(index, 1);
      } else {
        // Marquer les existantes comme supprimées
        this.infografias[index].isDeleted = true;
      }
    }
  }

  /** Restaurer une infographie supprimée */
  restaurerInfografia(index: number): void {
    if (index >= 0 && index < this.infografias.length) {
      this.infografias[index].isDeleted = false;
    }
  }

  /** Obtenir les infographies visibles (non supprimées) */
  get infografiasVisibles() {
    return this.infografias.filter(inf => !inf.isDeleted);
  }

  /** Obtenir les infographies supprimées */
  get infografiasSupprimees() {
    return this.infografias.filter(inf => inf.isDeleted && !inf.isNew);
  }

  /** Submit form */
  async modifierRecursos(): Promise<void> {
    if (this.destroyed || this.recursosForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    try {
      const payload = await this.preparePayload(this.recursosForm.value);
      await this.recursosService.modifierRecursos(parseInt(this.recursosId), payload);
      await this.router.navigate(['/admin-recursos-listar']);
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Error desconocido durante la actualización.';
    }
  }

  /** Préparer le payload */
  private async preparePayload(formValue: any) {
    const payload: any = { ...formValue };

    // Banner : utiliser le nouveau si modifié, sinon garder l'ancien
    if (this.bannerModified && this.newBanner) {
      payload.banner = this.newBanner;
    } else {
      payload.banner = this.currentBanner;
    }

    // Infographies : construire la nouvelle liste
    const infografias: string[] = [];

    for (const inf of this.infografias) {
      if (!inf.isDeleted) {
        if (inf.isNew && inf.file) {
          // Nouveau fichier - convertir en base64
          const dataUrl = await this.fileToBase64(inf.file);
          const clean = dataUrl.replace(/^data:[^;]+;base64,/, '');
          infografias.push(clean);
        } else if (!inf.isNew && inf.base64) {
          // Fichier existant conservé
          infografias.push(inf.base64);
        }
      }
    }

    payload.infografias = infografias;
    return payload;
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

  /** Retourner à la liste */
  retournerALaListe(): void {
    this.router.navigate(['/admin-recursos-listar']);
  }
}
