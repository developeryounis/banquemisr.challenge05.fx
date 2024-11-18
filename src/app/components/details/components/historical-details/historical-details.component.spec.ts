import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalDetailsComponent } from './historical-details.component';

describe('HistoricalDetailsComponent', () => {
  let component: HistoricalDetailsComponent;
  let fixture: ComponentFixture<HistoricalDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoricalDetailsComponent]
    });
    fixture = TestBed.createComponent(HistoricalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
