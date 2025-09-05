import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaAjouterComponent } from './categoria-ajouter.component';

describe('CategoriaAjouterComponent', () => {
  let component: CategoriaAjouterComponent;
  let fixture: ComponentFixture<CategoriaAjouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaAjouterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriaAjouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
