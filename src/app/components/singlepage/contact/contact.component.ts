import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      comment: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.http.post('/submit-contact', this.contactForm.value)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response: any) => {
          if (response?.success) {
            alert('¡Mensaje enviado con éxito!');
            this.contactForm.reset();
          } else {
            alert(response?.message || 'Ocurrió un error.');
          }
        },
        error: (err) => {
          console.error(err);
          alert('Ocurrió un error.');
        }
      });
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return controlName === 'name'
        ? 'El nombre es obligatorio'
        : controlName === 'email'
          ? 'El correo electrónico es obligatorio'
          : 'El mensaje es obligatorio';
    }
    if (control.errors['email']) return 'El correo electrónico no es válido';
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  // Méthodes utilitaires pour vérifier l'état des champs
  isFieldInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  isFieldValid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control && control.valid && control.touched);
  }
}
