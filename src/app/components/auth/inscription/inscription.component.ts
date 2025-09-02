import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth/auth.service";
import {LoginRequest} from "../../../models/login-request.model";
import {Router} from "@angular/router";
import {ActionLinkComponent} from "../../action-link/action-link.component";
import {ActionBtnComponent} from "../../action-btn/action-btn.component";
@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionBtnComponent, ActionLinkComponent, ActionBtnComponent],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.scss'
})
export class InscriptionComponent {
  inscriptionForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    mdp: new FormControl('', [Validators.required]),
    confirmMdp: new FormControl('', [Validators.required])

  });
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  inscription(): void {
    if (this.inscriptionForm.valid && (this.inscriptionForm.value?.mdp === this.inscriptionForm.value?.confirmMdp)) {
      const loginRequest: LoginRequest = {email: this.inscriptionForm.value?.email, mdp: this.inscriptionForm.value?.mdp}
      this.authService.inscription(loginRequest)
        .then(response => {
          console.log('Inscription réussie', response);
          localStorage.setItem('auth_token', response);
          this.errorMessage = '';
        })
        .catch(error => {
          this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription.';
          console.error('Erreur d\'inscription', error);
        });
    }
    else if(this.inscriptionForm.value?.mdp !== this.inscriptionForm.value?.confirmMdp){
      this.errorMessage = 'Les mots de passe ne correspondent pas';
    }
  }
}
