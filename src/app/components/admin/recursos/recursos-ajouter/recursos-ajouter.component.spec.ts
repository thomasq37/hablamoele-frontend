import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecursosAjouterComponent } from './recursos-ajouter.component';

describe('RecursosAjouterComponent', () => {
  let component: RecursosAjouterComponent;
  let fixture: ComponentFixture<RecursosAjouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursosAjouterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecursosAjouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
