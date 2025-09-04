import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecursosModifierComponent } from './recursos-modifier.component';

describe('RecursosModifierComponent', () => {
  let component: RecursosModifierComponent;
  let fixture: ComponentFixture<RecursosModifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursosModifierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecursosModifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
