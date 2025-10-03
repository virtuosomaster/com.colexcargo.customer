import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateShipmentPage } from './create-shipment.page';

describe('CreateShipmentPage', () => {
  let component: CreateShipmentPage;
  let fixture: ComponentFixture<CreateShipmentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateShipmentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
