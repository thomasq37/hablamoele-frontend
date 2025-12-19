import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { NgIf } from "@angular/common";
import { Subscription, timer } from 'rxjs';
import {NewsletterSubscriber} from "../../../models/newsletter-subscriber.model";
import {NewsletterSubscriberService} from "../../../services/newsletter-subscriber/newsletter-subscriber.service";

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './newsletter.component.html',
  styleUrl: './newsletter.component.scss'
})
export class NewsletterComponent implements OnInit, OnDestroy {
  protected newsletterForm: FormGroup;
  protected popupIsVisible = false;
  private timerSub?: Subscription;
  protected messageButtonSubmit: string = 'Enviar';

  constructor(private newsletterSubscriberService : NewsletterSubscriberService, private fb: FormBuilder, private http: HttpClient) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const alreadyShown = localStorage.getItem('newsletterPopupShown');

      if (!alreadyShown) {
        this.timerSub = timer(3000).subscribe(() => {
          this.popupIsVisible = true;
          if(localStorage){
            //localStorage.setItem('newsletterPopupShown', 'true');
          }
        });
      }
    }

  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  protected enregistrerEmail() {
    this.messageButtonSubmit = "Enviando...";
    if (this.newsletterForm.valid) {
      const newsletterSubscriber : NewsletterSubscriber = {
        email : this.newsletterForm.value.email
      }
      this.newsletterSubscriberService.ajouterNewsletterSubscriber(newsletterSubscriber).then(reponse =>{
        this.messageButtonSubmit = "Enviado!";
        setTimeout(() => {
          this.popupIsVisible = false;
        },1000)
      })

    }
  }

  protected fermerNewsletterPopup() {
    this.popupIsVisible = false;
    const newsletterSubscriber : NewsletterSubscriber = {
      email : "none"
    }
    this.newsletterSubscriberService.ajouterNewsletterSubscriber(newsletterSubscriber).then((reponse) =>{
      if(reponse !== false){
        console.log("Cierre de popup registrada");
      }
      else {
        console.log("Admin action. Cierre de popup no registrada");
      }
    })
  }
}
