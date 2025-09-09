import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {RecursosDTO} from "../../../models/recursos-dto.model";
import {Categoria} from "../../../models/categoria.model";
import {Nivel} from "../../../models/nivel.model";
import {RecursosService} from "../../../services/recursos/recursos.service";
import {CategoriaService} from "../../../services/categoria/categoria.service";
import {NivelService} from "../../../services/nivel/nivel.service";
import {DownloaderService} from "../../../services/downloader/downloader.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-recursos-preview',
  standalone: true,
    imports: [
        NgForOf,
        NgIf
    ],
  templateUrl: './recursos-preview.component.html',
  styleUrl: './recursos-preview.component.scss'
})
export class RecursosPreviewComponent implements OnInit {
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
      this.recursosService.listerDernieresInfographies(),
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
    // Empêcher le téléchargement si déjà en cours
    if (!recurso.id || this.downloadingRecursos.has(recurso.id)) {
      return;
    }

    try {
      // Marquer comme en cours de téléchargement
      this.downloadingRecursos.add(recurso.id);

      // Obtenir les infographies
      const infografias = await this.recursosService.obtenirInfografiasIdRecursos(recurso.id);

      // Initialiser la progression
      this.downloadProgress.set(recurso.id, { current: 0, total: infografias.length });

      // Télécharger chaque infographie
      for (let index = 0; index < infografias.length; index++) {
        const base64 = infografias[index];
        const nom = this.buildPdfName(
          recurso.titulo || 'recurso',
          `infografia-${index + 1}`
        );

        // Attendre un délai entre les téléchargements
        if (index > 0) {
          await this.delay(200);
        }

        // Télécharger
        await this.downloader.downloadBase64Pdf(base64, nom);

        // Mettre à jour la progression
        this.downloadProgress.set(recurso.id, {
          current: index + 1,
          total: infografias.length
        });
      }

      const visualisationAjoutee = await this.recursosService.ajouterVisualisacion(recurso.id);
      if (visualisationAjoutee) {
        console.log("Visualisation ajoutée avec succès");
      } else {
        console.log("Visualisation non ajoutée (utilisateur connecté ou erreur)");
      }

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      // Nettoyer l'état de téléchargement
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
      return `Descargar ${recurso.nbInfografias} infografía(s)`;
    }

    if (this.isDownloading(recurso.id)) {
      const progress = this.getDownloadProgress(recurso.id);
      if (progress) {
        return `Descargando... ${progress.current}/${progress.total}`;
      }
      return 'Descargando...';
    }

    return `Descargar ${recurso.nbInfografias} infografía(s)`;
  }
  naviuerARecursos() {
    this.router.navigate(['/recursos']);
  }
}
