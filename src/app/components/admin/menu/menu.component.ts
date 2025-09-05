import { Component, EventEmitter, HostListener, Input, Output, Inject, PLATFORM_ID } from '@angular/core';
import { NgForOf, NgIf } from "@angular/common";
import { Router } from "@angular/router";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Input() menuEstOuvert = false;
  @Input() menuItems: { nom: string, url: string }[] = [];
  protected grandEcran = false; // ✅ Valeur par défaut sécurisée

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // ✅ Initialiser seulement côté client
    if (isPlatformBrowser(this.platformId)) {
      this.grandEcran = window.innerWidth >= 992;
    }
  }

  @HostListener('window:resize')
  onResize() {
    // ✅ Vérifier qu'on est côté client
    if (isPlatformBrowser(this.platformId)) {
      this.grandEcran = window.innerWidth >= 992;
    }
  }

  toggleMenu(): void {
    this.menuEstOuvert = !this.menuEstOuvert;
  }

  deconnexion() {
    // ✅ Vérifier qu'on est côté client avant d'accéder à localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
    }
    this.router.navigate(['/homepage']);
  }
}
