import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  canActivate(): boolean {
    // ✅ Côté serveur, toujours autoriser l'accès
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    if (this.isLoggedIn()) {
      return true;
    } else {
      // Suppression du token si expiré ou invalide
      this.removeToken();
      // Redirection vers l'accueil
      this.router.navigate(['/connexion']);
      return false;
    }
  }

  isLoggedIn(): boolean {
    // ✅ Vérification côté client uniquement
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = this.getToken();
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(window.atob(parts[1]));

          // Vérification de l'expiration du token
          const now = Date.now().valueOf() / 1000;
          if (typeof payload.exp !== "undefined" && payload.exp < now) {
            console.log('Le token est expiré.');
            return false; // Le token est expiré
          }

          return true; // Le token est présent, au format JWT et pas expiré
        } catch (error) {
          console.error('Erreur de décodage du JWT :', error);
          return false; // Erreur de décodage, pas un JWT valide
        }
      }
    }

    return false; // Pas de token ou pas au format JWT
  }

  // ✅ Méthodes utilitaires pour gérer localStorage de façon sécurisée
  private getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('auth_token');
  }

  private removeToken(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem('auth_token');
  }

  // ✅ Méthode publique pour définir le token (utile pour le service d'auth)
  setToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem('auth_token', token);
  }
}
