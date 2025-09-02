// src/app/shared/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";

type ISODate = string; // ex: '2025-09-01T10:00:00.000Z'

export interface StripeKeyResponse {
  publishableKey: string;
}
export interface GooglePublicResponse {
  apiKey: string;
  calendarId: string;
}
export interface UnitAmountResponse {
  unitAmount: number | string; // renvoyé en centimes
}
export interface CheckoutSessionResponse {
  id: string; // sessionId Stripe
}
export interface PaymentStatusResponse {
  success: boolean;
}

export interface EventMeta {
  start_time: ISODate;
  end_time: ISODate;
}
export interface LineItem {
  price_data: {
    currency: string; // 'eur'
    product_data: { name: string };
    unit_amount: number; // centimes
  };
  quantity: number; // heures
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private base =  ''; // '' si même origine (SSR)

  constructor(private http: HttpClient) {}

  private url(path: string) {
    return `${this.base}${path}`;
  }

  // --- Public keys / config ---
  getStripeKey(): Observable<StripeKeyResponse> {
    return this.http.get<StripeKeyResponse>(this.url('/stripe-key'));
  }

  getGooglePublic(): Observable<GooglePublicResponse> {
    return this.http.get<GooglePublicResponse>(this.url('/google-api-key'));
  }

  getUnitAmount(): Observable<UnitAmountResponse> {
    return this.http.get<UnitAmountResponse>(this.url('/unit-amount'));
  }

  // --- Réservations ---
  createCheckoutSession(data: {
    items: LineItem[];
    formData: any;
    eventsMetadata: EventMeta[];
  }): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(this.url('/create-checkout-session'), data);
  }

  createFreeSession(data: {
    formData: any;
    eventsMetadata: EventMeta[];
  }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(this.url('/create-free-session'), data);
  }

  checkPaymentStatus(sessionId: string): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(
      this.url(`/check-payment-status?session_id=${encodeURIComponent(sessionId)}`)
    );
    // côté front, tu peux ensuite rediriger/afficher un message selon success
  }
}
