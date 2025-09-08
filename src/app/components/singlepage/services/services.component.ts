import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, NgForOf } from '@angular/common';

// (Types optionnels : OK en prod si 'embla-carousel' est en dependencies)
type EmblaCarouselType = import('embla-carousel').EmblaCarouselType;
type EmblaOptionsType = import('embla-carousel').EmblaOptionsType;

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewport') viewportRef!: ElementRef<HTMLElement>;

  embla: EmblaCarouselType | null = null;
  dots: number[] = [];
  currentSlide = 0;
  autoplayInterval: number | null = null;
  isBrowser = false;

  services = [
    {
      icon: 'assets/img/services/icon-spain.svg',
      alt: 'Icône Espagne',
      title: 'Cursos de Español',
      text: 'Aprende español de manera progresiva según tu nivel, desde principiante (A1) hasta avanzado (C1)'
    },
    {
      icon: 'assets/img/services/icon-thematique-.svg',
      alt: 'Icône Thématique',
      title: 'Cursos Temáticos',
      text: 'Cursos especializados en situaciones específicas de la vida (Viajes - Salud - Conversación - Compras)'
    },
    {
      icon: 'assets/img/services/icon-catalunya.png',
      alt: 'Icône Catalunya',
      title: 'Cursos de Catalán',
      text: 'Aprende catalán de manera progresiva según tu nivel, desde principiante (A1) hasta avanzado (B2)'
    },
    {
      icon: 'assets/img/services/icon-diploma.png',
      alt: 'Icône diplome',
      title: 'Preparación DELE',
      text: 'Prepara los exámenes oficiales DELE con cursos enfocados en superar cada nivel del certificado.'
    }
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Import dynamique "safe" compatible CJS/ESM :
   * - sur certains builds (SSR/Heroku), embla-carousel est vu comme un module CJS sans "call signatures".
   * - on normalise en récupérant (mod.default || mod) puis on caste en fonction.
   */
  private async loadEmblaFactory(): Promise<(root: HTMLElement, options?: EmblaOptionsType) => EmblaCarouselType> {
    const mod: any = await import('embla-carousel'); // pas de top-level import pour éviter SSR
    const factory = (mod && mod.default) ? mod.default : mod;
    return factory as (root: HTMLElement, options?: EmblaOptionsType) => EmblaCarouselType;
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;
    if (!this.viewportRef?.nativeElement) return;

    const EmblaCarousel = await this.loadEmblaFactory();

    // Options minimales (mise en page gérée par ton SCSS : 1 slide mobile, 3 desktop)
    this.embla = EmblaCarousel(this.viewportRef.nativeElement, {
      loop: true,
      align: 'start',
      slidesToScroll: 1
    } as EmblaOptionsType);

    if (this.embla) {
      const slideCount = this.embla.slideNodes().length;
      this.dots = Array.from({ length: slideCount }, (_, i) => i);

      this.embla.on('select', () => {
        // embla non nul ici mais on reste safe
        const selected = this.embla?.selectedScrollSnap();
        if (typeof selected === 'number') this.currentSlide = selected;
      });
    }

    this.startAutoplay();
  }

  goToSlide(index: number): void {
    this.embla?.scrollTo(index);
  }

  startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayInterval = window.setInterval(() => {
      this.embla?.scrollNext();
    }, 4000);
  }

  stopAutoplay(): void {
    if (this.autoplayInterval !== null) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    try {
      this.embla?.destroy();
    } catch { /* ignore */ }
    this.embla = null;
  }
}
