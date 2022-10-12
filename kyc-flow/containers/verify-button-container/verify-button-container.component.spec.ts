import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyButtonContainerComponent } from './verify-button-container.component';

describe('VerifyButtonContainerComponent', () => {
  let component: VerifyButtonContainerComponent;
  let fixture: ComponentFixture<VerifyButtonContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerifyButtonContainerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyButtonContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
