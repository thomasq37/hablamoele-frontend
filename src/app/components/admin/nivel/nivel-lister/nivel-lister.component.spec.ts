import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NivelListerComponent } from './nivel-lister.component';

describe('NivelListerComponent', () => {
  let component: NivelListerComponent;
  let fixture: ComponentFixture<NivelListerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NivelListerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NivelListerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
