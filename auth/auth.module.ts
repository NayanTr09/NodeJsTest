import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '../shared/shared.module';
import { SignupLoginMasterComponent } from './signup-login-master/signup-login-master.component';
import SignUpComponent from './components/sign-up/sign-up.component';
import LoginComponent from './components/login/login.component';
import VerifyOtpComponent from './components/verify-otp/verify-otp.component';
import ForgotPasswordComponent from './components/forgot-password/forgot-password.component';
import { authReducer } from '../store/auth/auth.reducer';
import { AuthEffects } from '../store/auth/auth.effects';

const authRoutes: Routes = [
  {
    path: '',
    component: SignupLoginMasterComponent,
    children: [
      {
        path: 'sign-up',
        component: SignUpComponent,
      },
      {
        path: 'sign-in',
        component: LoginComponent,
      },
      {
        path: 'verify-otp',
        component: VerifyOtpComponent,
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
      },
      {
        path: '',
        redirectTo: 'sign-in',
      },
    ],
  },
];

@NgModule({
  declarations: [
    SignupLoginMasterComponent,
    SignUpComponent,
    LoginComponent,
    VerifyOtpComponent,
    ForgotPasswordComponent
  ],
  imports: [
    RouterModule.forChild(authRoutes),
    CommonModule,
    FormsModule,
    SharedModule,
    StoreModule.forFeature('auth', authReducer),
    EffectsModule.forFeature([AuthEffects]),
  ],
  exports: [
    RouterModule,
    SignupLoginMasterComponent,
    SignUpComponent,
    LoginComponent,
    VerifyOtpComponent,
  ],
  providers: [],
})
export class AuthModule {}
