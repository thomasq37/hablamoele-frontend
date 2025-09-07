import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';

import { RecursosService } from '../../../services/recursos/recursos.service';
import { CategoriaService } from '../../../services/categoria/categoria.service';
import { NivelService } from '../../../services/nivel/nivel.service';

import { Recursos } from '../../../models/recursos.model';
import { Categoria } from '../../../models/categoria.model';
import { Nivel } from '../../../models/nivel.model';
import {DownloaderService} from "../../../services/downloader/downloader.service";

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './recursos.component.html',
  styleUrl: './recursos.component.scss'
})
export class RecursosComponent implements OnInit {
  protected recursos: Recursos[] = [];
  protected categorias: Categoria[] = [];
  protected niveles: Nivel[] = [];
  private isBrowser = false;
  // Sélections
  selectedNivelIds = new Set<number>();
  selectedCategoriaIds = new Set<number>();

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private recursosService: RecursosService,
    private categoriaService: CategoriaService,
    private nivelService: NivelService,
    private downloader: DownloaderService
  ) {}

  async ngOnInit(): Promise<void> {
    this.recursos = await this.recursosService.listerRecursos();
    this.categorias = await this.categoriaService.listerCategorias();
    this.niveles = await this.nivelService.listerNiveles();
  }
  onDescargar(recurso: Recursos): void {
    if(recurso.infografias){
      recurso.infografias.forEach((base64, index) => {
        const nom = this.buildPdfName(
          recurso.titulo || 'recurso',
          `infografia-${index + 1}`
        );
        setTimeout(() => this.downloader.downloadBase64Pdf(base64, nom), index * 200);
      });
      if(recurso.id){
        this.recursosService.incrementerVue(recurso.id).then(reponse =>{
          if (reponse == null) {
            console.log("Descarga no ha sido añadida a estadísticas (acción de admin o usuario conectado)");
          } else {
            console.log("Descarga añadida a estadísticas");
          }
        })
      }
    }
  }


  private buildPdfName(recursoTitle: string, infografiaTitle: string): string {
    const sanitize = (s: string) =>
      s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '');
    return `${sanitize(recursoTitle)}__${sanitize(infografiaTitle)}.pdf`;
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

  // --- (Optionnel) filtrage local si tu en as besoin
  get filteredRecursos(): Recursos[] {
    const byNivel = (r: Recursos) =>
      this.selectedNivelIds.size === 0 ||
      (Array.isArray((r as any).niveles) &&
        (r as any).niveles.some((n: Nivel) => n?.id != null && this.selectedNivelIds.has(n.id!)));

    const byCategoria = (r: Recursos) =>
      this.selectedCategoriaIds.size === 0 ||
      (Array.isArray((r as any).categorias) &&
        (r as any).categorias.some((c: Categoria) => c?.id != null && this.selectedCategoriaIds.has(c.id!)));

    return this.recursos.filter(r => byNivel(r) && byCategoria(r));
  }
}
