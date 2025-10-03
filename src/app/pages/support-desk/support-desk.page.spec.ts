import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportDeskPage } from './support-desk.page';

describe('SupportDeskPage', () => {
  let component: SupportDeskPage;
  let fixture: ComponentFixture<SupportDeskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportDeskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
