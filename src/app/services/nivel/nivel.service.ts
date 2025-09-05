import { Injectable } from '@angular/core';
import {Nivel} from "../../models/nivel.model";
import {authFetch} from "../auth/auth-fetch";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class NivelService {
  private apiUrl = `${environment.apiUrl}/niveles`;

  constructor() {}

  async listerNiveles(): Promise<Nivel[]> {
    const response = await fetch(`${this.apiUrl}`, { method: 'GET' });
    if (!response.ok) throw new Error('Erreur lors du chargement des niveaux');
    return await response.json();
  }

  async obtenirParIdNivel(id: number): Promise<Nivel> {
    const response = await authFetch(`${this.apiUrl}/${id}`, { method: 'GET' });
    if (!response.ok) throw new Error('Niveau introuvable');
    return await response.json();
  }

  async ajouterNivel(nivel: Nivel): Promise<Nivel> {
    const response = await authFetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nivel),
    });
    if (!response.ok) throw new Error('Erreur lors de la création du niveau');
    return await response.json();
  }

  async modifierNivel(id: number, nivel: Nivel): Promise<Nivel> {
    const response = await authFetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nivel),
    });
    if (!response.ok) throw new Error('Erreur lors de la modification du niveau');
    return await response.json();
  }

  async supprimerNivel(id: number | undefined): Promise<void> {
    const response = await authFetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erreur lors de la suppression du niveau');
  }
}
