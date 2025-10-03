import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportViewPage } from './support-view.page';

describe('SupportViewPage', () => {
  let component: SupportViewPage;
  let fixture: ComponentFixture<SupportViewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
