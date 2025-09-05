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
import KeenSlider, { KeenSliderInstance } from 'keen-slider';
import 'keen-slider/keen-slider.min.css';

@Component({
  selector: 'app-services',
  standalone: true,
  templateUrl: './services.component.html',
  imports: [NgForOf, NgIf],
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sliderRef') sliderRef!: ElementRef<HTMLElement>;

  slider: KeenSliderInstance | null = null;
  currentSlide = 0;
  dots: number[] = [];
  intervalId: any;
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // ✅ Attendre l'hydratation complète
    setTimeout(() => {
      if (this.sliderRef?.nativeElement && !this.slider) {
        this.initSlider();
      }
    }, 0);
  }

  private initSlider(): void {
    if (!this.isBrowser || typeof window === 'undefined' || !this.sliderRef?.nativeElement) {
      return;
    }
    try {
      this.slider = new KeenSlider(this.sliderRef.nativeElement, {
        loop: true,
        mode: 'free-snap',
        breakpoints: {
          '(min-width: 320px)': { slides: { perView: 1, spacing: 5 } },
          '(min-width: 400px)': { slides: { perView: 1, spacing: 5 } },
          '(min-width: 1000px)': { slides: { perView: 3, spacing: 20 } }
        },
        slides: {
          perView: 1,
          spacing: 20
        },
        created: (slider) => {
          this.dots = [...Array(slider.track.details.slides.length).keys()];
          // ✅ Forcer une mise à jour après création
          setTimeout(() => slider.update(), 0);
          setTimeout(() => this.startAutoplay(), 100);
        },
        slideChanged: (slider) => {
          this.currentSlide = slider.track.details.rel;
        },
        dragStarted: () => this.stopAutoplay(),
        dragEnded: () => this.startAutoplay()
      });

      // ✅ Événements souris
      this.sliderRef.nativeElement.addEventListener('mouseover', () => this.stopAutoplay());
      this.sliderRef.nativeElement.addEventListener('mouseout', () => this.startAutoplay());

    } catch (error) {
      console.error('Erreur slider:', error);
    }
  }

  startAutoplay() {
    if (!this.isBrowser || !this.slider) return;
    this.stopAutoplay();
    this.intervalId = setInterval(() => {
      this.slider?.next();
    }, 5000);
  }

  stopAutoplay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    if (this.slider) {
      this.slider.destroy();
      this.slider = null;
    }
  }
}
