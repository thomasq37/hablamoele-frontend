import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, NgForOf, NgIf } from '@angular/common';

type EmblaCarouselType = import('embla-carousel').EmblaCarouselType;
type EmblaOptionsType = import('embla-carousel').EmblaOptionsType;

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewport') viewportRef!: ElementRef<HTMLElement>;
  embla: EmblaCarouselType | null = null;
  dots: number[] = [];
  currentSlide = 0;
  autoplayInterval: any;
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

  async ngAfterViewInit() {
    if (!this.isBrowser) return;

    const { default: EmblaCarousel } = await import('embla-carousel');

    this.embla = EmblaCarousel(this.viewportRef.nativeElement, {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 1000px)': { slidesToScroll: 1 }
      }
    } as EmblaOptionsType);

    this.dots = Array.from({ length: this.embla.slideNodes().length }, (_, i) => i);

    this.embla.on('select', () => {
      this.currentSlide = this.embla!.selectedScrollSnap();
    });

    this.startAutoplay();
  }

  goToSlide(index: number) {
    this.embla?.scrollTo(index);
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.embla?.scrollNext();
    }, 4000);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
    this.embla?.destroy();
  }
}
