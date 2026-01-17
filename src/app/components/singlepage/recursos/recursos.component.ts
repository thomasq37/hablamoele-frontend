import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';

import { RecursosService } from '../../../services/recursos/recursos.service';
import { CategoriaService } from '../../../services/categoria/categoria.service';
import { NivelService } from '../../../services/nivel/nivel.service';
import { Categoria } from '../../../models/categoria.model';
import { Nivel } from '../../../models/nivel.model';
import {DownloaderService} from "../../../services/downloader/downloader.service";
import {RecursosDTO} from "../../../models/recursos-dto.model";
import {Router} from "@angular/router";
import {MenuComponent} from "../../admin/menu/menu.component";
import {FooterComponent} from "../footer/footer.component";

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [NgForOf, NgIf, MenuComponent, FooterComponent],
  templateUrl: './recursos.component.html',
  styleUrl: './recursos.component.scss'
})
export class RecursosComponent implements OnInit {
  protected recursos: RecursosDTO[] = [];
  protected categorias: Categoria[] = [];
  protected niveles: Nivel[] = [];
  private isBrowser = false;
  protected isLoading = true
  // Sélections
  selectedNivelIds = new Set<number>();
  selectedCategoriaIds = new Set<number>();

  // États de téléchargement
  downloadingRecursos = new Set<number>(); // IDs des recursos en cours de téléchargement
  downloadProgress = new Map<number, { current: number, total: number }>(); // Progression
  menuItems = [
    { nom: 'Inicio', url: '/homepage' }
  ];
  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private recursosService: RecursosService,
    private categoriaService: CategoriaService,
    private nivelService: NivelService,
    private downloader: DownloaderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    Promise.all([
      this.recursosService.listerRecursos(),
      this.categoriaService.listerCategorias(),
      this.nivelService.listerNiveles()
    ])
      .then(([recursos, categorias, niveles]) => {
        this.recursos = recursos;
        this.categorias = categorias;
        this.niveles = niveles;
      })
      .catch(error => {
        console.error('Erreur lors du chargement:', error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
  async onDescargar(recurso: RecursosDTO): Promise<void> {
    if (!recurso.id || this.downloadingRecursos.has(recurso.id)) {
      return;
    }

    try {
      this.downloadingRecursos.add(recurso.id);

      const infografiaUrls =
        await this.recursosService.obtenirInfografiasIdRecursos(recurso.id);

      this.downloadProgress.set(recurso.id, {
        current: 0,
        total: infografiaUrls.length
      });

      for (let i = 0; i < infografiaUrls.length; i++) {
        const url = infografiaUrls[i];
        const nombre = this.buildPdfName(
          recurso.titulo || 'recurso',
          `infografia-${i + 1}`
        );

        // 👉 téléchargement direct (sans fetch)
        this.downloader.download(url, nombre);

        this.downloadProgress.set(recurso.id, {
          current: i + 1,
          total: infografiaUrls.length
        });

        // Petite pause pour éviter que le navigateur bloque
        await this.delay(250);
      }

      await this.recursosService.ajouterVisualisacion(recurso.id);

    } catch (err) {
      console.error('Erreur téléchargement :', err);
    } finally {
      this.downloadingRecursos.delete(recurso.id);
      this.downloadProgress.delete(recurso.id);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildPdfName(recursoTitle: string, infografiaTitle: string): string {
    const sanitize = (s: string) =>
      s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '');
    return `${sanitize(recursoTitle)}__${sanitize(infografiaTitle)}.pdf`;
  }

  // Méthodes pour vérifier l'état de téléchargement
  isDownloading(recursoId?: number): boolean {
    return recursoId ? this.downloadingRecursos.has(recursoId) : false;
  }

  getDownloadProgress(recursoId?: number): { current: number, total: number } | null {
    return recursoId ? this.downloadProgress.get(recursoId) || null : null;
  }

  getDownloadButtonText(recurso: RecursosDTO): string {
    if (!recurso.id) {
      return `Descargar`;
    }

    if (this.isDownloading(recurso.id)) {
      const progress = this.getDownloadProgress(recurso.id);
      if (progress) {
        return `Descargando...`;
      }
      return 'Descargando...';
    }

    return `Descargar`;
  }

  // --- TrackBy
  trackByNivelId = (_: number, n: Nivel) => n.id;
  trackByCategoriaId = (_: number, c: Categoria) => c.id;

  // --- Sélecteurs (toggle)
  toggleNivel(id?: number): void {
    if (id == null) return;
    this.selectedNivelIds.has(id) ? this.selectedNivelIds.delete(id) : this.selectedNivelIds.add(id);
  }

  toggleCategoria(id?: number): void {
    if (id == null) return;
    this.selectedCategoriaIds.has(id) ? this.selectedCategoriaIds.delete(id) : this.selectedCategoriaIds.add(id);
  }

  clearNivel(): void {
    this.selectedNivelIds.clear();
  }

  clearCategoria(): void {
    this.selectedCategoriaIds.clear();
  }

  clearAll(): void {
    this.clearNivel();
    this.clearCategoria();
  }

  get hasAnyFilter(): boolean {
    return this.selectedNivelIds.size > 0 || this.selectedCategoriaIds.size > 0;
  }

  // --- Filtrage local
  get filteredRecursos(): RecursosDTO[] {
    const byNivel = (r: RecursosDTO) =>
      this.selectedNivelIds.size === 0 ||
      (Array.isArray(r.niveles) &&
        r.niveles.some((n: Nivel) => n?.id != null && this.selectedNivelIds.has(n.id!)));

    const byCategoria = (r: RecursosDTO) =>
      this.selectedCategoriaIds.size === 0 ||
      (Array.isArray(r.categorias) &&
        r.categorias.some((c: Categoria) => c?.id != null && this.selectedCategoriaIds.has(c.id!)));

    return this.recursos.filter(r => byNivel(r) && byCategoria(r));
  }

  naviuerARecursos() {
    this.router.navigate(['/recursos']);
  }

  scrollToReservation(event: Event) {
    event.preventDefault(); // empêche le comportement par défaut
    const el = document.getElementById('reservations');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
