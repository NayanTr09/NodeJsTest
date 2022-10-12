import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AadharCardOtpGeneratorComponent } from './aadhar-gstin-otp-generator.component';

describe('AadharCardOtpGeneratorComponent', () => {
  let component: AadharCardOtpGeneratorComponent;
  let fixture: ComponentFixture<AadharCardOtpGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AadharCardOtpGeneratorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AadharCardOtpGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
