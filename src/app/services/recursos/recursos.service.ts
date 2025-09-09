import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Recursos } from '../../models/recursos.model';
import {authFetch} from "../auth/auth-fetch";
import {AuthGuard} from "../../guards/auth.guard";
import {RecursosDTO} from "../../models/recursos-dto.model";
import {RecursosVisualisacionDTO} from "../../models/recursos-visualisacion-dto.model";

@Injectable({
  providedIn: 'root'
})
export class RecursosService {
  private apiUrl = `${environment.apiUrl}/recursos`;

  constructor(private authGuard: AuthGuard) { }

  async listerRecursos(): Promise<RecursosDTO[]> {
    const response = await fetch(`${this.apiUrl}`, { method: 'GET' });
    if (!response.ok) throw new Error('Erreur lors du chargement des ressources');
    return await response.json();
  }

  async listerDernieresInfographies(): Promise<RecursosDTO[]> {
    const response = await fetch(`${this.apiUrl}/ultimas`, { method: 'GET' });
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des dernières infographies');
    }
    return await response.json();
  }

  async obtenirInfografiasIdRecursos(id: number): Promise<string[]>{
    const response = await fetch(`${this.apiUrl}/${id}/infografias`, { method: 'GET' });
    if (!response.ok) throw new Error('Ressource introuvable');
    return await response.json();
  }
  async obtenirParIdRecursos(id: number): Promise<Recursos> {
    const response = await authFetch(`${this.apiUrl}/${id}`, { method: 'GET' });
    if (!response.ok) throw new Error('Ressource introuvable');
    return await response.json();
  }

  async ajouterRecursos(recursos: Recursos): Promise<Recursos> {
    const response = await authFetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recursos),
    });
    if (!response.ok) throw new Error('Erreur lors de la création de la ressource');
    return await response.json();
  }

  async modifierRecursos(id: number, recursos: Recursos): Promise<Recursos> {
    const response = await authFetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recursos),
    });
    if (!response.ok) throw new Error('Erreur lors de la modification de la ressource');
    return await response.json();
  }

  async supprimerRecursos(id: number | undefined): Promise<void> {
    const response = await authFetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erreur lors de la suppression de la ressource');
  }

  /*async listerStatsRecursos(): Promise<RecursosStatistiquesDTO[]> {
    const response = await authFetch(`${this.apiUrl}/stats`, { method: 'GET' });
    if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
    return await response.json();
  }

  async incrementerVue(id: number): Promise<RecursosStatistiquesDTO | null> {
    if (this.authGuard.isLoggedIn()) {
      return null;
    }
    const response = await fetch(`${this.apiUrl}/${id}/ajouter-visualisation`, { method: 'POST' });
    if (!response.ok) throw new Error("Erreur lors de l'incrément des vues");
    return await response.json();
  }*/
  async ajouterVisualisacion(recursosId: number): Promise<boolean> {
    if (this.authGuard.isLoggedIn()) {
      return false;
    }
    try {
      const response = await fetch(`${this.apiUrl}/${recursosId}/ajouter-visualisation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la visualisation");
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la visualisation:', error);
      return false;
    }
  }

  async obtenirToutesVisualisations(): Promise<RecursosVisualisacionDTO[]> {
    const response = await authFetch(`${this.apiUrl}/visualisations`, { method: 'GET' });
    if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
    return await response.json();
  }
}
