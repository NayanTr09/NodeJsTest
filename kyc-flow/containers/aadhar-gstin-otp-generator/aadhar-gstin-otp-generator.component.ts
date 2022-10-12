import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AadharGstApiResponse } from '../../models/AadharGstApiResponse';
import { KycFlowService } from '../../services/kyc-flow.service';
const STATES = ['ENTER_AADHAR_GSTIN_STATE', 'ENTER_OTP_STATE', 'VERIFIED_STATE'];
const DIGITS_IN_OTP = 6;
@Component({
  selector: 'app-aadhar-gstin-otp-generator',
  templateUrl: './aadhar-gstin-otp-generator.component.html',
  styleUrls: ['./aadhar-gstin-otp-generator.component.scss'],
})
export class AadharCardOtpGeneratorComponent implements OnInit {
  allStates: string[] = STATES;
  state: string = STATES[0];
  numbers: number[] = [];
  isOtpFilled: boolean = false;
  @Input() businessStructure = 1;
  @Input() isAadharPage: boolean = true;
  @Output() manualKycEvent = new EventEmitter();
  @Output() verifyKycEvent = new EventEmitter();
  constructor(
    private fb: FormBuilder,
    private kycService: KycFlowService,
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService
  ) { }
  aadharCardForm = this.fb.group({
    aadharCardNumber: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(12),
        Validators.minLength(12),
      ],
    ],
  });
  gstinForm = this.fb.group({
    gstinNumber: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(15),
        Validators.minLength(15),
      ],
    ],
  });
  ngOnInit(): void {
    this.numbers = Array(DIGITS_IN_OTP);
  }
  submitNumberAndGenerateOtp() {
    this.ngxLoader.start('generateAadharGstinOtp');
    const observable = this.isAadharPage
      ? this.kycService.generateAadharOtp({
        aadhaar_number: this.aadharCardForm.value.aadharCardNumber,
        kyc_type: this.businessStructure,
      })
      : this.kycService.generateGstinOtp({
        gst_number: this.gstinForm.value.gstinNumber,
        kyc_type: this.businessStructure,
      });
    observable.subscribe(
      (resp: AadharGstApiResponse) => {
        this.ngxLoader.stop('generateAadharGstinOtp');
        if (resp.success) {
          this.kycService.showNotification('success', resp.message);
          this.state = STATES[1];
        } else {
          this.kycService.showNotification('warning', resp.message);
        }
      },
      (error) => {
        if (error?.error?.message) {
          this.toastr.error(error.error.message);
        }
        this.ngxLoader.stop('generateAadharGstinOtp');
      }
    );
  }
  changeToAadharFormat(value: string): string {
    return (
      value.slice(0, 4) + '-' + value.slice(4, 8) + '-' + value.slice(8, 12)
    );
  }
  editAadhar() {
    this.state = STATES[0];
  }
  submit() {
    this.ngxLoader.start('verifyAadharGstinOtp');
    const observable = this.isAadharPage
      ? this.kycService.verifyAadharOtp({
        otp: this.optString(),
        kyc_type: this.businessStructure,
      })
      : this.kycService.verifyGstinOtp({
        otp: this.optString(),
        kyc_type: this.businessStructure,
      });
    observable.subscribe(
      (resp: AadharGstApiResponse) => {
        this.ngxLoader.stop('verifyAadharGstinOtp');
        if (resp.success) {
          this.verifyKycEvent.emit();
          this.state = this.allStates[2];
        }
      },
      (error) => {
        if (error?.error?.message) {
          this.toastr.error(error.error.message);
        }
        this.ngxLoader.stop('verifyAadharGstinOtp');
      }
    );
  }
  otpFilled() {
    for (let i = 0; i < DIGITS_IN_OTP; i++) {
      if (
        (<HTMLInputElement>document.getElementById(i.toString()))?.value === ''
      ) {
        return false;
      }
    }
    return true;
  }
  optString() {
    let otp = '';
    for (let i = 0; i < DIGITS_IN_OTP; i++) {
      otp += (<HTMLInputElement>document.getElementById(i.toString()))?.value;
    }
    return otp;
  }
  resetOtp() {
    for (let i = 0; i < DIGITS_IN_OTP; i++) {
      (<HTMLInputElement>document.getElementById(i.toString())).value = '';
    }
    this.isOtpFilled = false;
  }
  prevent(event: any) {
    if (
      (event.which !== 13 &&
        event.which !== 8 &&
        event.which !== 0 &&
        event.which < 48) ||
      event.which > 57
    ) {
      event.preventDefault();
    }
  }
  next(event: any, id: any) {
    const element = <HTMLInputElement>document.getElementById(id);
    if (element.value === '' && event.which === 8 && id !== 0) {
      const previousElement = <HTMLInputElement>(
        document.getElementById((id - 1).toString())
      );
      previousElement.focus();
    } else if (
      id !== DIGITS_IN_OTP - 1 &&
      event.key !== 'e' &&
      event.key !== 'E' &&
      !isNaN(event.key) &&
      !isNaN(parseFloat(event.key))
    ) {
      const nextElement = <HTMLInputElement>document.getElementById(id + 1);
      nextElement.focus();
      nextElement.select();
    }
    this.isOtpFilled = this.otpFilled();
  }
  resendOtp() {
    this.resetOtp();
    this.submitNumberAndGenerateOtp();
  }
}
