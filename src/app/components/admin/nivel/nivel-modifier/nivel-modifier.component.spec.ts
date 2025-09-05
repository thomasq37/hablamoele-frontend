import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NivelModifierComponent } from './nivel-modifier.component';

describe('NivelModifierComponent', () => {
  let component: NivelModifierComponent;
  let fixture: ComponentFixture<NivelModifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NivelModifierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NivelModifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
