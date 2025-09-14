import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {authFetch} from "../auth/auth-fetch";
import {NewsletterSubscriber} from "../../models/newsletter-subscriber.model";
import {AuthGuard} from "../../guards/auth.guard";

@Injectable({
  providedIn: 'root'
})
export class NewsletterSubscriberService {
  private apiUrl = `${environment.apiUrl}/newsletter-subscriber`;

  constructor(private authGuard: AuthGuard) {}

  async listerNewsletterSubscriber(): Promise<NewsletterSubscriber[]> {
    const response = await authFetch(`${this.apiUrl}`, { method: 'GET' });
    if (!response.ok) throw new Error('Erreur lors du chargement des niveaux');
    return await response.json();
  }

  async obtenirParIdNewsletterSubscriber(id: number): Promise<NewsletterSubscriber> {
    const response = await authFetch(`${this.apiUrl}/${id}`, { method: 'GET' });
    if (!response.ok) throw new Error('Niveau introuvable');
    return await response.json();
  }

  async ajouterNewsletterSubscriber(newsletterSubscriber: NewsletterSubscriber): Promise<NewsletterSubscriber | boolean> {
    if (this.authGuard.isLoggedIn()) {
      return false;
    }
    const response = await fetch(`${this.apiUrl}/ajouter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsletterSubscriber),
    });
    if (!response.ok) throw new Error('Erreur lors de la création du niveau');
    return await response.json();
  }

  async modifierNewsletterSubscriber(id: number, newsletterSubscriber: NewsletterSubscriber): Promise<NewsletterSubscriber> {
    const response = await authFetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsletterSubscriber),
    });
    if (!response.ok) throw new Error('Erreur lors de la modification du niveau');
    return await response.json();
  }

  async supprimerNewsletterSubscriber(id: number | undefined): Promise<void> {
    const response = await authFetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erreur lors de la suppression du niveau');
  }
}
