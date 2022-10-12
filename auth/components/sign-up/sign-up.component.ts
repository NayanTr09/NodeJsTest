import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { signUp } from 'src/app/store/auth/auth.actions';
import { Store } from '@ngrx/store';
import { AuthService } from '../../services/auth.service';
import { setErrorsForm } from 'src/app/shared/constants/constants';
import { AppState } from 'src/app/store/store.reducer';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export default class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  submitted: boolean = false;
  isPasswordVisible: boolean = false;
  queryParams: any = {};
  bikayi_merchant_id: any = '';
  bikayi_access_token: any = '';
  mobile: any = '';
  constructor(
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private store: Store<AppState>,
    private ga: GoogleAnalyticsService
  ) {}

  ngOnInit(): void {
    this.ga.eventEmitter('Sign-up page view', 'Onboarding/Signup');
    this.route.queryParams.subscribe((params) => {
      let urlParams: any = {};
      let USER_SIGNUP_DETAILS = JSON.parse(
        localStorage.getItem('USER_SIGNUP_DETAILS') || '{}'
      );
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
      this.mobile = urlParams['phone'] ?? '';
      localStorage.setItem('USER_SIGNUP_DETAILS', JSON.stringify(urlParams));
    });

    this.signUpForm = this.formBuilder.group({
      first_name: [
        {
          value: this.getQueryParamValue('first_name'),
          disabled: this.isDisabled('first_name'),
        },
        Validators.required,
      ],
      last_name: [
        {
          value: this.getQueryParamValue('last_name'),
          disabled: this.isDisabled('last_name'),
        },
        Validators.required,
      ],
      company_name: [
        {
          value: this.getQueryParamValue('company_name'),
          disabled: this.isDisabled('company_name'),
        },
        Validators.required,
      ],
      email: [
        {
          value: this.getQueryParamValue('email'),
          disabled: false,
        },
        Validators.required,
      ],
      phone: [
        {
          value: this.getQueryParamValue('phone'),
          disabled: this.isDisabled('phone'),
        },
        Validators.compose([
          Validators.required,
          Validators.pattern('^[6789][0-9]{9}$'),
        ]),
      ],
      password: [
        { value: '', disabled: false },
        Validators.compose([
          Validators.required,
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+*!=]).*$'),
        ]),
      ],
    });
  }

  getQueryParamValue(key: string) {
    return this.queryParams[key] ?? '';
  }

  isDisabled(key: string) {
    let isNullOrUndefined = !!this.queryParams[key];
    return isNullOrUndefined;
  }

  navigateToSignIn(): void {
    const queryParams = {
      email: this.queryParams.email,
    };
    this.ga.eventEmitter('Clicked on Sign In', 'Onboarding/Signup');
    this.router.navigate(['/auth/sign-in'], { queryParams });
  }

  // convenience getter for easy access to form fields
  get signUpFormControls() {
    return this.signUpForm.controls;
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get company_name() {
    return this.signUpForm.get('company_name');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get first_name() {
    return this.signUpForm.get('first_name');
  }

  get last_name() {
    return this.signUpForm.get('last_name');
  }

  get phone() {
    return this.signUpForm.get('phone');
  }

  handleSignUp(): void {
    this.ga.eventEmitter('Clicked on Sign Up', 'Onboarding/Signup');
    this.ngxLoader.start('signUp');
    const body: any = {
      first_name: this.signUpForm.controls['first_name'].value,
      last_name: this.signUpForm.controls['last_name'].value,
      company_name: this.signUpForm.controls['company_name'].value,
      email: this.signUpForm.controls['email'].value,
      password: this.signUpForm.controls['password'].value,
      device_id: localStorage.getItem('device_id'),
      phone: this.signUpForm.controls['phone'].value
    };
    if (this.bikayi_merchant_id) {
      body['bikayi_merchant_id'] = this.bikayi_merchant_id;
    }
    if (this.bikayi_access_token) {
      body['bikayi_access_token'] = this.bikayi_access_token;
    }
    if (this.mobile && !body['phone']) {
      body['phone'] = this.mobile;
    }
    this.authService.signUp(body).subscribe(
      (res) => {
        this.ngxLoader.stop('signUp');
        this.saveUserDetails(body);
        localStorage.setItem('USER_ID', res.id);
        localStorage.setItem('UNVERIFIED_TOKEN', res.token);
        this.store.dispatch(signUp({ user: res }));
        this.router.navigateByUrl('/auth/verify-otp');
      },
      (error) => {
        this.ngxLoader.stop('signUp');
        if (error?.error) {
          if (error?.status == 403 && error?.error?.message) {
            this.toastr.error(error.error.message);
          } else if (error?.status == 422 && error?.error?.errors) {
            this.toastr.error(error.error.message);
            setErrorsForm(this.signUpForm, error.error.errors);
          }
        }
      }
    );
  }

  getPasswordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  saveUserDetails(body: any) {
    let USER_SIGNUP_DETAILS = JSON.parse(
      localStorage.getItem('USER_SIGNUP_DETAILS') || '{}'
    );
    const data = {
      ...USER_SIGNUP_DETAILS,
      ...body,
      phone: this.signUpForm.controls['phone'].value,
    };
    delete data['password'];
    delete data['device_id'];
    localStorage.setItem('USER_SIGNUP_DETAILS', JSON.stringify(data));
  }
  
  clickedOnPrivacyPolicy() {
    this.ga.eventEmitter('Clicked on privacy policy', 'Onboarding/Signup');
  }

  clickedOnTandC() {
    this.ga.eventEmitter('Clicked on T&C', 'Onboarding/Signup');
  }
}
