import { Component, OnInit, ViewChildren, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { interval, noop, timer } from 'rxjs';
import { logIn } from 'src/app/store/auth/auth.actions';
import { AuthService } from '../../services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { AppState } from 'src/app/store/store.reducer';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
})
export default class VerifyOtpComponent implements OnInit, OnDestroy {
  formInput = ['input1', 'input2', 'input3', 'input4', 'input5', 'input6'];

  @ViewChildren('formRow') rows: any;
  verifyOtpForm!: FormGroup;
  isOtpOnCallEnabled: boolean = true;
  isTimerOn: boolean = false;
  secondsInAMinute = 60;

  mobile: any = JSON.parse(localStorage.getItem('USER_SIGNUP_DETAILS') || '{}')
    ?.phone;

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private store: Store<AppState>,
    private ga: GoogleAnalyticsService
  ) {}

  ngOnInit(): void {
    this.verifyOtpForm = this.toFormGroup(this.formInput);
    this.sendOtp();
  }

  handleStartCountdownTimer() {
    this.ga.eventEmitter('Clicked on Get OTP on Call', 'Onboarding/Signup');
    this.isTimerOn = true;
    this.isOtpOnCallEnabled = false;
    const oneMin = 60000;
    const timer$ = timer(oneMin);
    const counterSubscription$ = interval(1000)
      .pipe(takeUntil(timer$))
      .subscribe(
        () => {
          this.secondsInAMinute = this.secondsInAMinute - 1;
        },
        noop,
        () => {
          counterSubscription$.unsubscribe();
          this.isTimerOn = false;
          this.isOtpOnCallEnabled = true;
          this.secondsInAMinute = 60;
        }
      );
  }

  changeTo2Digit(number: number) {
    return number > 9 ? '' + number : '0' + number;
  }

  toFormGroup(elements: string[]) {
    const group: any = {};
    elements.forEach((key: any) => {
      group[key] = new FormControl('', Validators.required);
    });
    return new FormGroup(group);
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

  ngOnDestroy() {
    // this.counterSubscription$.unsubscribe();
  }

  onSubmit(): void {
    this.ga.eventEmitter('Clicked on Submit OTP', 'Onboarding/Signup');
    this.ngxLoader.start('onSubmit');
    const otp = Object.values(this.verifyOtpForm.value).join('');
    const body = {
      otp,
    };
    if (otp.length < 6) {
      this.toastr.error('Please Enter 6 digit OTP');
      this.ngxLoader.stop('onSubmit');
      return;
    }
    const USER_ID = localStorage.getItem('USER_ID');
    this.authService.verifyOTP(USER_ID, body).subscribe(
      (res: any) => {
        this.ngxLoader.stop('onSubmit');
        this.store.dispatch(logIn({ user: res }));
        localStorage.setItem('AUTH_TOKEN', res.token);
        localStorage.removeItem('UNVERIFIED_TOKEN');
        this.router.navigateByUrl('/orders/list');
      },
      (error) => {
        this.ngxLoader.stop('onSubmit');
        if (error?.error?.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error(error);
        }
      }
    );
  }

  resendOTP(): void {
    this.ga.eventEmitter('Clicked on Resend OTP', 'Onboarding/Signup');
    this.ngxLoader.start('resendOTP');
    const USER_ID = localStorage.getItem('USER_ID');
    const body = {
      token: localStorage.getItem('UNVERIFIED_TOKEN'),
      mobile: this.mobile,
    };
    this.authService.resendOTP(USER_ID, body).subscribe(
      () => {
        this.toastr.success('OTP resent successfully');
        this.ngxLoader.stop('resendOTP');
      },
      (error) => {
        this.ngxLoader.stop('resendOTP');
        if (error?.error) {
          if (
            (error?.status == 403 || error?.status == 400) &&
            error?.error?.message
          ) {
            this.toastr.error(error.error.message);
          }
        }
      }
    );
  }

  sendOtp() {
    const userId = localStorage.getItem('USER_ID');
    this.ngxLoader.start('sendOtp');
    const body = {
      mobile: this.mobile,
      token: localStorage.getItem('UNVERIFIED_TOKEN'),
      is_web: 1,
    };
    this.authService.sendOTP(userId, body).subscribe(
      () => {
        this.toastr.success('OTP sent successfully');
        this.ngxLoader.stop('sendOtp');
      },
      (error) => {
        this.ngxLoader.stop('sendOtp');
        if (
          (error?.status == 403 || error?.status == 400) &&
          error?.error?.message
        ) {
          this.toastr.error(error.error.message);
        }
      }
    );
  }

  sendOtpOnCall() {
    const userId = localStorage.getItem('USER_ID');
    this.ngxLoader.start('sendOtp');
    const body = {
      mobile: this.mobile,
      token: localStorage.getItem('UNVERIFIED_TOKEN'),
      is_web: 1,
    };
    this.authService.sendOTPOnCall(userId, body).subscribe(
      () => {
        this.toastr.success('OTP sent successfully');
        this.handleStartCountdownTimer();
        this.ngxLoader.stop('sendOtp');
      },
      (error) => {
        this.ngxLoader.stop('sendOtp');
        if (
          (error?.status == 403 || error?.status == 400) &&
          error?.error?.message
        ) {
          this.toastr.error(error.error.message);
        }
      }
    );
  }
}
