// src/app/shared/count-up.directive.ts
import {
  AfterViewInit,
  Directive,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements AfterViewInit, OnDestroy {
  /** Valeur finale à atteindre */
  @Input('appCountUp') end = 0;
  /** Valeur de départ */
  @Input() start = 0;
  /** Durée de l’animation (ms) */
  @Input() duration = 1200;
  /** Lancer une seule fois (true) ou à chaque ré-entrée dans le viewport */
  @Input() once = true;
  /** Pré/suffixes optionnels (ex: '+') */
  @Input() prefix = '';
  @Input() suffix = '';
  /** Seuil de visibilité IntersectionObserver (0..1) */
  @Input() threshold = 0.25;

  private observer?: IntersectionObserver;
  private animId: number | null = null;
  private running = false;
  private startedOnce = false;
  private readonly inBrowser: boolean;

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.inBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.inBrowser) return;

    const node = this.el.nativeElement;
    this.observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) {
          this.startAnim();
          if (this.once) this.observer?.disconnect();
        } else if (!this.once) {
          this.reset();
        }
      },
      { threshold: this.threshold }
    );
    this.observer.observe(node);
  }

  private startAnim(): void {
    if (this.running) return;
    if (this.once && this.startedOnce) return;

    this.running = true;
    this.startedOnce = true;

    const from = this.start;
    const to = this.end;
    const dur = Math.max(1, this.duration);
    const t0 = performance.now();

    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      // easing doux
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = Math.round(from + (to - from) * eased);
      this.el.nativeElement.textContent = `${this.prefix}${val}${this.suffix}`;

      if (p < 1) {
        this.animId = requestAnimationFrame(step);
      } else {
        this.running = false;
        this.animId = null;
      }
    };

    this.animId = requestAnimationFrame(step);
  }

  private reset(): void {
    if (this.animId != null) cancelAnimationFrame(this.animId);
    this.animId = null;
    this.running = false;
    this.el.nativeElement.textContent = `${this.prefix}${this.start}${this.suffix}`;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.animId != null) cancelAnimationFrame(this.animId);
  }
}
