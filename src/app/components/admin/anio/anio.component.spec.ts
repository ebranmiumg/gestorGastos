import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnioComponent } from './anio.component';

describe('AnioComponent', () => {
  let component: AnioComponent;
  let fixture: ComponentFixture<AnioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnioComponent]
    });
    fixture = TestBed.createComponent(AnioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
