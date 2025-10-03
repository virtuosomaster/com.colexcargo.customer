import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimViewPage } from './claim-view.page';

describe('ClaimViewPage', () => {
  let component: ClaimViewPage;
  let fixture: ComponentFixture<ClaimViewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
