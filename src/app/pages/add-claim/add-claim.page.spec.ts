import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddClaimPage } from './add-claim.page';

describe('AddClaimPage', () => {
  let component: AddClaimPage;
  let fixture: ComponentFixture<AddClaimPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClaimPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
