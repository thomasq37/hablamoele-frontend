import {Component, Inject, PLATFORM_ID} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActionBtnComponent} from "../action-btn/action-btn.component";
import {ActionLinkComponent} from "../action-link/action-link.component";
import {AuthService} from "../../services/auth/auth.service";
import {LoginRequest} from "../../models/login-request.model";
import {Router} from "@angular/router";


@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionBtnComponent, ActionLinkComponent, ActionBtnComponent],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.scss'
})
export class ConnexionComponent {
  private isBrowser = false;

  connexionForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    mdp: new FormControl('', [Validators.required])
  });
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router, @Inject(PLATFORM_ID) platformId: Object) { }

  connexion(): void {
    if (!this.isBrowser) return;

    if (this.connexionForm.valid) {
      const loginRequest: LoginRequest = this.connexionForm.value;
      this.authService.connexion(loginRequest)
        .then(response => {
          console.log('Connexion réussie', response);
          localStorage.setItem('auth_token', response);
          this.router.navigate(['/admin-dashboard']);
          this.errorMessage = '';
        })
        .catch(error => {
          console.log(error)
          this.errorMessage = error.message || 'Une erreur est survenue lors de la connexion.';
          console.error('Erreur de connexion', error);
        });
    } else {
      this.errorMessage = 'Le formulaire de connexion n\'est pas valide.';
    }
  }

}
