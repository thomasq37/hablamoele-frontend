import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterListeComponent } from './newsletter-liste.component';

describe('NewsletterListeComponent', () => {
  let component: NewsletterListeComponent;
  let fixture: ComponentFixture<NewsletterListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterListeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsletterListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
