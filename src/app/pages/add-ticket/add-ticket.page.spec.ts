import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTicketPage } from './add-ticket.page';

describe('AddTicketPage', () => {
  let component: AddTicketPage;
  let fixture: ComponentFixture<AddTicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
