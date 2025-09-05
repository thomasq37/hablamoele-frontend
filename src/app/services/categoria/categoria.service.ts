import { Injectable } from '@angular/core';
import {Categoria} from "../../models/categoria.model";
import {authFetch} from "../auth/auth-fetch";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor() {}

  async listerCategorias(): Promise<Categoria[]> {
    const response = await fetch(`${this.apiUrl}`, { method: 'GET' });
    if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
    return await response.json();
  }

  async obtenirParIdCategoria(id: number): Promise<Categoria> {
    const response = await authFetch(`${this.apiUrl}/${id}`, { method: 'GET' });
    if (!response.ok) throw new Error('Catégorie introuvable');
    return await response.json();
  }

  async ajouterCategoria(categoria: Categoria): Promise<Categoria> {
    const response = await authFetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoria),
    });
    if (!response.ok) throw new Error('Erreur lors de la création de la catégorie');
    return await response.json();
  }

  async modifierCategoria(id: number, categoria: Categoria): Promise<Categoria> {
    const response = await authFetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoria),
    });
    if (!response.ok) throw new Error('Erreur lors de la modification de la catégorie');
    return await response.json();
  }

  async supprimerCategoria(id: number | undefined): Promise<void> {
    const response = await authFetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erreur lors de la suppression de la catégorie');
  }
}
