import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Recursos } from '../../models/recursos.model';

@Injectable({
  providedIn: 'root'
})
export class RecursosService {
  private apiUrl = `${environment.apiUrl}/recursos`;

  constructor() { }

  async listerRecursos(): Promise<Recursos[]> {
    const response = await fetch(`${this.apiUrl}`, { method: 'GET' });
    if (!response.ok) throw new Error('Erreur lors du chargement des ressources');
    return await response.json();
  }

  async obtenirParIdRecursos(id: number): Promise<Recursos> {
    const response = await fetch(`${this.apiUrl}/${id}`, { method: 'GET' });
    if (!response.ok) throw new Error('Ressource introuvable');
    return await response.json();
  }

  async ajouterRecursos(recursos: Recursos): Promise<Recursos> {
    const response = await fetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recursos),
    });
    if (!response.ok) throw new Error('Erreur lors de la création de la ressource');
    return await response.json();
  }

  async modifierRecursos(id: number, recursos: Recursos): Promise<Recursos> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recursos),
    });
    if (!response.ok) throw new Error('Erreur lors de la modification de la ressource');
    return await response.json();
  }

  async supprimerRecursos(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erreur lors de la suppression de la ressource');
  }
}
