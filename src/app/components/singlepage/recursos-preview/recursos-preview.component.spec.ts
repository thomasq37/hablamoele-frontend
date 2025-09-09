import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecursosPreviewComponent } from './recursos-preview.component';

describe('RecursosPreviewComponent', () => {
  let component: RecursosPreviewComponent;
  let fixture: ComponentFixture<RecursosPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursosPreviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecursosPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
