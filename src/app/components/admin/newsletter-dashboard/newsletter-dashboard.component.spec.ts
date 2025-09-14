import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterDashboardComponent } from './newsletter-dashboard.component';

describe('NewsletterDashboardComponent', () => {
  let component: NewsletterDashboardComponent;
  let fixture: ComponentFixture<NewsletterDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsletterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
