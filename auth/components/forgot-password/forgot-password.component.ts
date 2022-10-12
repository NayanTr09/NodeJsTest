import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
const STATES = ['ENTER_DATA_STATE', 'VERIFY_OTP_STATE', 'CHANGE_PASSWORD_STATE'];
@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Shiprocket</h4>
    </div>
    <div class="modal-body">
      <p>Password reset successfully. Now login with your new password.</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="close()">Ok</button>
    </div>
  `,
  styles: [`
    .modal-title {
      width: 100%;
      text-align: center;
      font-size: 20px !important;
      font-weight: 500 !important;
      font-family: sans-serif !important;
    }
    .modal-header {
      border-bottom: none !important;
      height: 20px !important;
    }
    p {
      font-family: sans-serif !important;
      text-align: center;
      margin-bottom: 0 !important;
    }
    .modal-footer {
      display: block !important;
      text-align: center;
      width: 100%;
      font-size: 16px;
      color: #6f57e9;
    }
  `]
})
export class NgbdModalContent {
  @Input() name: string = '';
  close(): void {
    this.activeModal.dismiss();
    this.router.navigateByUrl('/auth/sign-in');
  }
  constructor(public activeModal: NgbActiveModal,
    public router: Router) {}
}

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export default class ForgotPasswordComponent implements OnInit {
  allStates: string[] = STATES;
  state: string = STATES[0];
  loginForm!: FormGroup;
  queryParams: any = {};
  formInput = ['input1', 'input2', 'input3', 'input4', 'input5', 'input6'];
  @ViewChildren('formRow') rows: any;
  verifyOtpForm!: FormGroup;
  changePasswordForm!: FormGroup;
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  responseMobile: string = '';
  responseEmail: string = '';
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      for (let key in params) {
        this.queryParams[key] = params[key];
      }
    });
    this.verifyOtpForm = this.toFormGroup(this.formInput);
    this.loginForm = this.formBuilder.group({
      email: [
        {
          value: this.getQueryParamValue('email') || this.getQueryParamValue('phone'),
          disabled: false,
        },
        Validators.compose([Validators.required, Validators.email, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]),
      ],
    });
    this.changePasswordForm = this.formBuilder.group({
      password: [
        { value: '', disabled: false },
        Validators.compose([
          Validators.required,
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+*!=]).*$'),
        ]),
      ],
      confirmPassword: [
        { value: '', disabled: false },
        Validators.compose([
          Validators.required,
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+*!=]).*$'),
        ]),
      ],
    })
  }

  getQueryParamValue(key: string) {
    return this.queryParams[key] ?? '';
  }


  // convenience getter for easy access to form fields
  get loginFormControls() {
    return this.loginForm.controls;
  }

  get email() {
    return this.loginForm.get('email');
  }

  forgotPasswordSendOtp(body: any) {
    this.authService.forgotPasswordSendOtp(body).subscribe(
      (res) => {
        this.responseEmail = res?.email;
        this.responseMobile = res?.mobile;
        this.state = this.allStates[1];
        this.ngxLoader.stop('forgotPasswordSendOtp');
        this.toastr.success('OTP sent successfully');
      },
      (error) => {
        this.ngxLoader.stop('forgotPasswordSendOtp');
        this.toastr.error(error.error.message);
      }
    );
  }

  getFormGroup(): FormGroup {
    switch(this.state) {
      case this.allStates[0]:
        return this.loginForm;
      case this.allStates[1]:
        return this.verifyOtpForm;
      case this.allStates[2]:
        return this.changePasswordForm;
    }
    return this.loginForm;
  }
  getImageSrc(): string {
    switch(this.state) {
      case this.allStates[0]:
        return '/assets/images/login/forgot-password-1.png';
      case this.allStates[1]:
        return '/assets/images/login/verify-otp.png';
      case this.allStates[2]:
        return '/assets/images/login/forgot-password-3.png';
    }
    return '';
  }

  getHeaderText(): string {
    if(this.state === this.allStates[2]) {
      return 'Reset Password';
    }
    return 'Forgot Your Password';
  }

  getMiddleText(): string {
    switch(this.state) {
      case this.allStates[0]:
        return 'Enter your registered email id or mobile number to receive OTP for password reset.';
      case this.allStates[1]:
        return `OTP sent to ${this.responseEmail} and ${this.responseMobile}. Please enter it below.`;
      case this.allStates[2]:
        return 'Enter new password';
    }
    return '';
  }

  keyUpEvent(event: any, index: number) {
    let pos = index;
    if (event.keyCode === 8 && event.which === 8) {
      pos = index - 1;
    } else {
      pos = index + 1;
    }
    if (pos > -1 && pos < this.formInput.length) {
      this.rows._results[pos].nativeElement.focus();
    }
  }

  toFormGroup(elements: string[]) {
    const group: any = {};
    elements.forEach((key: any) => {
      group[key] = new FormControl('', Validators.required);
    });
    return new FormGroup(group);
  }

  get password() {
    return this.changePasswordForm.get('password');
  }

  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }

  getPasswordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  getConfirmPasswordInputType() {
    return this.isConfirmPasswordVisible ? 'text' : 'password';
  }

  getButtonText(): string {
    switch(this.state) {
      case this.allStates[0]:
        return 'Send OTP'; 
      case this.allStates[1]:
        return 'Submit OTP';
      case this.allStates[2]:
        return 'Reset Password';
    }
    return '';
  }

  isSubmitDisabled(): boolean {
    switch(this.state) {
      case this.allStates[0]:
        return this.email?.errors?.required || this.email?.errors?.pattern && this.email?.errors?.email;
      case this.allStates[1]:
        return this.verifyOtpForm.invalid;
      case this.allStates[2]:
        return this.changePasswordForm.controls['password'].value != this.changePasswordForm.controls['confirmPassword'].value || this.changePasswordForm.invalid;
    }
    return true;
  }

  sendOtp(): void {
    this.ngxLoader.start('forgotPasswordSendOtp');
    const body = {
      data: this.loginForm.controls['email'].value,
      is_web: 1
    };
    this.forgotPasswordSendOtp(body);
  }

  onSubmit(): void {
    let body: any = {};
    const otp = Object.values(this.verifyOtpForm.value).join('');
    switch(this.state) {
      case this.allStates[0]:
        this.sendOtp();
        break;
      case this.allStates[1]:
        body = {
          data: this.loginForm.controls['email'].value,
          otp: otp,
          is_web: 1
        };
        this.ngxLoader.start('forgotPasswordVerifyOtp');
        this.authService.forgotPasswordVerifyOtp(body).subscribe(
          () => {
            this.state = this.allStates[2];
            this.ngxLoader.stop('forgotPasswordVerifyOtp');
          },
          (error) => {
            this.ngxLoader.stop('forgotPasswordVerifyOtp');
            this.toastr.error(error.error.message);
          }
        )
        break;
      case this.allStates[2]:
        body = {
          data: this.loginForm.controls['email'].value,
          otp: otp,
          is_web: 1,
          password: this.changePasswordForm.controls['password'].value,
          password_confirm: this.changePasswordForm.controls['confirmPassword'].value,
        };
        this.ngxLoader.start('resetPassword');
        this.authService.resetPassword(body).subscribe(
          () => {
            this.ngxLoader.stop('resetPassword');
            let ngbModalOptions: NgbModalOptions = {
              backdrop : 'static',
              keyboard : false
            };
            const modalRef = this.modalService.open(NgbdModalContent, ngbModalOptions);
            modalRef.componentInstance.name = 'World';
          },
          (error) => {
            this.ngxLoader.stop('resetPassword');
            this.toastr.error(error.error.message);
          }
        )
        break;
    }
  }
}
