import { TestBed } from '@angular/core/testing';

import { NewsletterSubscriberService } from './newsletter-subscriber.service';

describe('NewsletterSubscriberService', () => {
  let service: NewsletterSubscriberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsletterSubscriberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
