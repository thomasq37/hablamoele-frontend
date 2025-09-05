import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaListerComponent } from './categoria-lister.component';

describe('CategoriaListerComponent', () => {
  let component: CategoriaListerComponent;
  let fixture: ComponentFixture<CategoriaListerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaListerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriaListerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
