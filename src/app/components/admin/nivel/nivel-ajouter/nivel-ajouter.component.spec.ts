import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NivelAjouterComponent } from './nivel-ajouter.component';

describe('NivelAjouterComponent', () => {
  let component: NivelAjouterComponent;
  let fixture: ComponentFixture<NivelAjouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NivelAjouterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NivelAjouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
