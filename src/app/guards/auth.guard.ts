import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    if (this.isLoggedIn()) {
      return true;
    } else {
      // Suppression du token si expiré ou invalide
      localStorage.removeItem('auth_token');
      // Redirection vers l'accueil
      this.router.navigate(['/accueil']);
      return false;
    }
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token');
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
}
