import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsletterSubscriber } from "../../../../models/newsletter-subscriber.model";
import { NewsletterSubscriberService } from "../../../../services/newsletter-subscriber/newsletter-subscriber.service";

@Component({
  selector: 'app-newsletter-liste',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './newsletter-liste.component.html',
  styleUrl: './newsletter-liste.component.scss'
})
export class NewsletterListeComponent implements OnInit {
  subscribers: NewsletterSubscriber[] = [];
  closedCount = 0;
  loading = true;
  error: string | null = null;

  constructor(private newsletterService: NewsletterSubscriberService) {}

  async ngOnInit() {
    try {
      const allSubs = await this.newsletterService.listerNewsletterSubscriber();

      // Séparer ceux qui ont fermé sans email (email === 'none')
      this.closedCount = allSubs.filter(sub => sub.email === 'none').length;

      // Garder uniquement les vrais abonnés
      this.subscribers = allSubs.filter(sub => sub.email !== 'none');
    } catch (e) {
      this.error = 'Impossible de charger la liste';
    } finally {
      this.loading = false;
    }
  }

  supprimerAbonne(id: number | undefined) {
    this.newsletterService.supprimerNewsletterSubscriber(id).then(() => {
      this.subscribers = this.subscribers.filter(sub => sub.id !== id);
    })
  }
}
