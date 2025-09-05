import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaModifierComponent } from './categoria-modifier.component';

describe('CategoriaModifierComponent', () => {
  let component: CategoriaModifierComponent;
  let fixture: ComponentFixture<CategoriaModifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaModifierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriaModifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
