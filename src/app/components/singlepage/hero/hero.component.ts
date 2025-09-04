import { Component, ChangeDetectionStrategy, OnDestroy, AfterViewInit, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {Router} from "@angular/router";

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  texts = ['Profesora de español', 'Iniciación', 'Cursos avanzados'];

  typed = '';
  private textIndex = 0;
  private charIndex = 0;
  private clickPourNaviguerAdmin = 0;
  cursorBlink = true;

  // Compatible Node + Browser
  private timeouts: Array<ReturnType<typeof setTimeout>> = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {
    // Ne lance l'animation que dans le navigateur
    if (isPlatformBrowser(this.platformId)) {
      // Petit délai pour s'assurer que la vue est complètement initialisée
      setTimeout(() => {
        this.startTypingAnimation();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.clearAllTimeouts();
  }

  private clearAllTimeouts(): void {
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];
  }

  private startTypingAnimation(): void {
    this.zone.runOutsideAngular(() => {
      this.schedule(() => this.typeNext(), 300);
    });
  }

  private schedule(fn: () => void, delay: number): void {
    const id = setTimeout(() => {
      // On ré-entre dans Angular pour mettre à jour l'état
      this.zone.run(() => {
        fn();
        // Déclencher la détection de changement manuellement
        this.cdr.markForCheck();
      });
    }, delay);
    this.timeouts.push(id);
  }

  private get current(): string {
    return this.texts[this.textIndex];
  }

  private typeNext(): void {
    if (this.charIndex < this.current.length) {
      this.cursorBlink = false;
      this.typed = this.current.slice(0, this.charIndex + 1);
      this.charIndex++;
      this.schedule(() => this.typeNext(), 120);
    } else {
      this.cursorBlink = true;
      this.schedule(() => this.eraseNext(), 1500); // Pause un peu plus longue
    }
  }

  private eraseNext(): void {
    if (this.charIndex > 0) {
      this.cursorBlink = false;
      this.typed = this.current.slice(0, this.charIndex - 1);
      this.charIndex--;
      this.schedule(() => this.eraseNext(), 80);
    } else {
      this.cursorBlink = true;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      this.schedule(() => this.typeNext(), 1000);
    }
  }

  naviguerAAdmin() {
    this.clickPourNaviguerAdmin++
    if(this.clickPourNaviguerAdmin >= 5) {
      this.router.navigate(['/admin-dashboard']);
    }
  }
}
