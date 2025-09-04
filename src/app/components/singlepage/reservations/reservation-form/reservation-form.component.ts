// src/app/components/reservations/reservation-form/reservation-form.component.ts
import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

type Slot = { start: Date; end: Date };

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.scss']
})
export class ReservationFormComponent implements OnChanges {
  @Output() submitReservation = new EventEmitter<any>();

  /** créneaux sélectionnés (depuis le parent) */
  @Input() selectedSlots: Slot[] = [];

  /** prix unitaire en centimes (ex: 3000 = 30,00€) */
  @Input() unitAmount = 0;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    mail: ['', [Validators.required, Validators.email]],
    courseType: ['niveles', Validators.required],
    level: ['a1'],
    levelCatalan: ['a1'],
    topic: ['viajes'],
    goals: ['', Validators.required],
    freeTrial: [{ value: false}] // Désactivé par défaut
  });

  constructor(private fb: FormBuilder) {}

  // --- Getters utiles ---
  get courseType(): string { return this.form.get('courseType')!.value as string; }

  /** total d'heures sélectionnées (suppose des créneaux entiers d'1h) */
  get selectedHours(): number {
    return this.selectedSlots.reduce((sum, s) => {
      const h = (new Date(s.end).getTime() - new Date(s.start).getTime()) / 3_600_000;
      return sum + h;
    }, 0);
  }

  /** la case "Primera hora" est permise uniquement si 1 seul créneau de 1h */
  get allowFreeTrial(): boolean {
    return this.selectedSlots.length === 1 && this.selectedHours === 1;
  }

  /** prix total en centimes selon sélection + case cochée */
  get priceCents(): number {
    // Si aucun créneau sélectionné, prix = 0
    if (this.selectedSlots.length === 0) {
      return 0;
    }

    // si la première heure gratuite est cochée ET autorisée
    const free = this.allowFreeTrial && this.form.get('freeTrial')!.value === true ? 1 : 0;
    const payableHours = Math.max(0, this.selectedHours - free);
    return Math.round(payableHours * this.unitAmount);
  }

  /** libellé du bouton "Reservar — 45 €" ou juste "Reservar" si 0€ */
  get submitLabel(): string {
    const euros = (this.priceCents / 100);
    return euros > 0
      ? `Reservar — ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(euros)}`
      : 'Reservar';
  }

  /** bouton activé uniquement si formulaire valide + au moins 1 créneau */
  get canSubmit(): boolean {
    return this.form.valid && this.selectedSlots.length > 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedSlots']) {
      const ctrl = this.form.get('freeTrial')!;
      // Si les conditions sont réunies → activer la checkbox
      if (this.allowFreeTrial) {
        if (ctrl.disabled) {
          ctrl.enable({ emitEvent: false });
        }
      } else {
        if (ctrl.enabled) {
          ctrl.setValue(false, { emitEvent: false }); // décocher si elle était cochée
          ctrl.disable({ emitEvent: false });
        }
      }
    }
  }


  submit() {
    if (!this.canSubmit) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    // validations conditionnelles
    if (raw.courseType === 'tematicos' && !raw.topic) {
      alert('Selecciona una temática.'); return;
    }
    if (raw.courseType === 'catalan' && !raw.levelCatalan) {
      alert('Selecciona un nivel de catalán.'); return;
    }
    if ((raw.courseType === 'niveles' || raw.courseType === 'dele') && !raw.level) {
      alert('Selecciona un nivel.'); return;
    }

    // payload pour le parent
    const payload = {
      name: raw.name,
      mail: raw.mail,
      courseType: raw.courseType,
      level: raw.courseType === 'catalan' ? raw.levelCatalan : raw.level,
      topic: raw.courseType === 'tematicos' ? raw.topic : '',
      goals: raw.goals,
      freeTrial: !!raw.freeTrial
    };

    this.submitReservation.emit(payload);
  }
}
