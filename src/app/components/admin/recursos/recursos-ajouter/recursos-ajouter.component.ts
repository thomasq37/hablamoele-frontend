import { Component, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MenuComponent } from "../../menu/menu.component";
import { ActionBtnComponent } from "../../../action-btn/action-btn.component";
import { RecursosService } from "../../../../services/recursos/recursos.service";

@Component({
  selector: 'app-recursos-ajouter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MenuComponent,
    ActionBtnComponent,
  ],
  templateUrl: './recursos-ajouter.component.html',
  styleUrls: ['./recursos-ajouter.component.scss']
})
export class RecursosAjouterComponent {
  errorMessage = '';
  recursosForm: FormGroup;
  private destroyed = false;
  private isBrowser = false;

  // Refs inputs fichiers
  @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('infografiasInput') infografiasInput!: ElementRef<HTMLInputElement>;

  // État local
  banner: string = '';
  bannerFileName: string = '';
  infografiaFiles: File[] = [];
  infografiaFileNames: string[] = [];

  menuItems = [
    { nom: 'Volver al sitio web', url: '/homepage' },
    { nom: 'Administrar recursos', url: '/admin-recursos-listar' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
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

  ngOnDestroy(): void {
    this.destroyed = true;
  }

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

  /** Submit form */
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
      await this.recursosService.ajouterRecursos(payload);
      await this.router.navigate(['/admin-recursos-listar']);
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Error desconocido durante el guardado.';
    }
  }

  /** Préparer le payload */
  private async preparePayload(formValue: any) {
    // Convertir les infographies PDF en base64
    const infografias: string[] = [];

    for (const file of this.infografiaFiles) {
      const dataUrl = await this.fileToBase64(file);
      const clean = dataUrl.replace(/^data:[^;]+;base64,/, '');
      infografias.push(clean);
    }

    return {
      ...formValue,
      banner: this.banner,
      infografias
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
