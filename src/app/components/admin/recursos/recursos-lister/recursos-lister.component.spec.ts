import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecursosListerComponent } from './recursos-lister.component';

describe('RecursosListerComponent', () => {
  let component: RecursosListerComponent;
  let fixture: ComponentFixture<RecursosListerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursosListerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecursosListerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
