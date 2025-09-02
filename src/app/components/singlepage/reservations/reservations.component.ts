import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgIf} from '@angular/common';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import {ReservationService} from "../../../services/reservation/reservation.service";
import {CalendarComponent} from "./calendar/calendar.component";
import {ReservationFormComponent} from "./reservation-form/reservation-form.component";

type Slot = { start: Date; end: Date };

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CalendarComponent,
    ReservationFormComponent,
    NgIf
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'

})
export class ReservationsComponent implements OnInit {
  googleApiKey = 'AIzaSyDpqLXh5YkIDTy6nIfR2lAkKqiiI5HKIgc';
  calendarId = 'hablamoseleonline@gmail.com';
  selectedSlots: Slot[] = [];
  unitAmount = 1800;
  showCalendar = false;
  private stripe: Stripe | null = null;
  private isBrowser = false;

  constructor(
    private api: ReservationService,
    @Inject(PLATFORM_ID) platformId: Object,
    private cdRef: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    // Récupère les infos publiques pour le calendrier
    /**/

    // Stripe côté navigateur
    if (this.isBrowser) {
      const { publishableKey } = await firstValueFrom(this.api.getStripeKey());
      this.stripe = await loadStripe(publishableKey);
      this.api.getGooglePublic().subscribe(({ apiKey, calendarId }) => {
        this.googleApiKey = apiKey;
        this.calendarId = calendarId;
        this.showCalendar = true;
      });

      // Prix unitaire en centimes
      this.api.getUnitAmount().subscribe(({ unitAmount }) => {
        this.unitAmount = Number(unitAmount) || 0;
      });
    }
  }

  onSlotToggled(slot: Slot) {
    const key = slot.start.toISOString() + '|' + slot.end.toISOString();

    const exists = this.selectedSlots.some(
      s => s.start.toISOString() + '|' + s.end.toISOString() === key
    );

    if (exists) {
      this.selectedSlots = this.selectedSlots.filter(
        s => s.start.toISOString() + '|' + s.end.toISOString() !== key
      ); // ⛔️ remplace par un nouveau tableau sans l'élément
    } else {
      this.selectedSlots = [...this.selectedSlots, slot]; // ✅ nouveau tableau avec l'ajout
    }
  }





  async onFormSubmit(formData: any) {
    if (!this.selectedSlots.length) {
      alert('Sélectionne au moins un créneau.');
      return;
    }

    const eventsMetadata = this.selectedSlots.map(s => ({
      start_time: new Date(s.start).toISOString(),
      end_time: new Date(s.end).toISOString(),
    }));

    // 1ère heure gratuite si cochée et un seul créneau
    if (formData?.freeTrial && this.selectedSlots.length === 1) {
      this.api.createFreeSession({ formData, eventsMetadata }).subscribe({
        next: () => alert('Sesión gratuita confirmada. Revisa tu email.'),
        error: () => alert('Error creación sesión gratuita')
      });
      return;
    }

    // Paiement Stripe
    const items = this.selectedSlots.map(s => {
      const hours = (new Date(s.end).getTime() - new Date(s.start).getTime()) / 3_600_000;
      return {
        price_data: {
          currency: 'eur',
          product_data: { name: 'Reserva de clase' },
          unit_amount: this.unitAmount, // centimes par heure
        },
        quantity: hours,
      };
    });

    const session = await firstValueFrom(
      this.api.createCheckoutSession({ items, formData, eventsMetadata })
    );
    await this.stripe?.redirectToCheckout({ sessionId: session.id });
  }
}
