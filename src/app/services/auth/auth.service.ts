import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {LoginRequest} from "../../models/login-request.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient) { }

  async connexion(utilisateur: LoginRequest): Promise<string> {
    const response = await fetch(`${this.apiUrl}/auth/connexion`, {
      method: 'POST', // Définir la méthode HTTP sur POST pour envoyer des données.
      headers: {
        'Content-Type': 'application/json', // Préciser le type de contenu envoyé
      },
      body: JSON.stringify(utilisateur), // Convertir l'objet utilisateur en chaîne JSON pour l'envoyer.
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.text(); // Vous pouvez adapter cette ligne si l'API renvoie une structure spécifique que vous souhaitez retourner.
  }

  async inscription(utilisateur: LoginRequest): Promise<string> {
    const response = await fetch(`${this.apiUrl}/auth/inscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Préciser le type de contenu envoyé
      },
      body: JSON.stringify(utilisateur), // Convertir l'objet utilisateur en chaîne JSON pour l'envoyer.
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.text();
  }
}
