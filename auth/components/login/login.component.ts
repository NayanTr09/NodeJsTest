import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Store } from '@ngrx/store';
import { logIn } from 'src/app/store/auth/auth.actions';
import { setErrorsForm } from 'src/app/shared/constants/constants';
import { AppState } from 'src/app/store/store.reducer';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export default class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted: boolean = false;
  isPasswordVisible: boolean = false;
  queryParams: any = {};
  bikayi_merchant_id: any = '';
  bikayi_access_token: any = '';
  phone: any = '';

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private store: Store<AppState>,
    private ga: GoogleAnalyticsService,
  ) {}

  ngOnInit(): void {
    this.ga.eventEmitter('SignIn page view', 'Onboarding/Signin');
    localStorage.clear();
    this.route.queryParams.subscribe((params) => {
      let urlParams: any = {};
      let USER_SIGNUP_DETAILS = JSON.parse(
        localStorage.getItem('USER_SIGNUP_DETAILS') || '{}'
      );
      delete USER_SIGNUP_DETAILS['bikayi_merchant_id'];
      delete USER_SIGNUP_DETAILS['phone'];
      delete USER_SIGNUP_DETAILS['bikayi_access_token'];
      urlParams = {
        ...USER_SIGNUP_DETAILS,
        ...urlParams,
      };
      for (let key in params) {
        this.queryParams[key] = params[key];
        urlParams[key] = params[key];
      }
      this.bikayi_merchant_id = urlParams['bikayi_merchant_id'] ?? '';
      this.bikayi_access_token = urlParams['bikayi_access_token'] ?? '';
      this.phone = urlParams['phone'] ?? '';
      localStorage.setItem('USER_SIGNUP_DETAILS', JSON.stringify(urlParams));
      const token = params['token'];
      if (token != undefined && token != '') {
        this.login({
          token: token,
          is_web: 1
        });
      }
    });

    this.loginForm = this.formBuilder.group({
      email: [
        {
          value: this.getQueryParamValue('email'),
          disabled: false,
        },
        Validators.compose([Validators.required, Validators.email]),
      ],
      password: ['', Validators.required],
    });
  }

  getQueryParamValue(key: string) {
    return this.queryParams[key] ?? '';
  }

  navigateToSignUp(): void {
    this.ga.eventEmitter('Clicked on Sign Up', 'Onboarding/Signin');
    this.router.navigate(['/auth/sign-up']);
  }

  // convenience getter for easy access to form fields
  get loginFormControls() {
    return this.loginForm.controls;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    this.ga.eventEmitter('Clicked on Sign In', 'Onboarding/Signin');
    this.ngxLoader.start('login');
    const body: any = {
      email: this.loginForm.controls['email'].value,
      password: this.loginForm.controls['password'].value,
      device_id: localStorage.getItem('device_id'),
    };
    if (this.bikayi_merchant_id) {
      body['bikayi_merchant_id'] = this.bikayi_merchant_id;
    }
    if (this.bikayi_access_token) {
      body['bikayi_access_token'] = this.bikayi_access_token;
    }
    if (this.phone) {
      body['phone'] = this.phone;
    }
    this.login(body);
  }

  login(body: any) {
    this.authService.login(body).subscribe(
      (res) => {
        this.store.dispatch(logIn({ user: res }));
        localStorage.setItem('AUTH_TOKEN', res.token);
        localStorage.setItem('USER_ID', res.id);
        localStorage.removeItem('UNVERIFIED_TOKEN');
        this.ngxLoader.stop('login');
        this.router.navigateByUrl('/orders');
      },
      (error) => {
        this.ngxLoader.stop('login');
        if (error?.error) {
          if (error?.status == 400 || error?.error?.otp_confirmed == false) {
            if (error?.error?.mobile != '') {
              let signUpDetails: any = JSON.parse(localStorage.getItem('USER_SIGNUP_DETAILS') as string);
              signUpDetails['phone'] = error?.error?.mobile;
              localStorage.setItem('USER_SIGNUP_DETAILS', JSON.stringify(signUpDetails));
            }
            if (error?.error?.token) {
              localStorage.setItem('UNVERIFIED_TOKEN', error.error.token);
            }
            if (error?.error?.id) {
              localStorage.setItem('USER_ID', error.error.id);
            }
            this.router.navigateByUrl('/auth/verify-otp');
          } else if (error?.status == 403 && error?.error?.message) {
            this.toastr.error(error.error.message);
          } else if (error?.status == 422 && error?.error?.errors) {
            this.toastr.error(error.error.message);
            setErrorsForm(this.loginForm, error.error.errors);
          }
        }
      }
    );
  }

  getPasswordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  clickedOnPrivacyPolicy() {
    this.ga.eventEmitter('Clicked on privacy policy', 'Onboarding/Signin');
  }

  clickedOnTandC() {
    this.ga.eventEmitter('Clicked on T&C', 'Onboarding/Signin');
  }
}
