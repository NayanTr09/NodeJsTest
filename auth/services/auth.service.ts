import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from 'src/app/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpService) {}

  login(body: any): Observable<any> {
    let apiUrl = 'auth/login';
    if(body.token && body.token != '') {
      apiUrl = 'auth/login/user';
    }
    return this.http.post(apiUrl, body);
  }

  signUp(body: any): Observable<any> {
    const apiUrl = 'auth/register';
    return this.http.post(apiUrl, body);
  }

  sendOTP(userId: any, body: any) {
    const apiUrl = 'auth/' + userId + '/otp/send';
    return this.http.post(apiUrl, body);
  }

  sendOTPOnCall(userId: any, body: any) {
    const apiUrl = 'auth/' + userId + '/otp/on_call';
    return this.http.post(apiUrl, body);
  }

  resendOTP(userId: any, body: any) {
    const apiUrl = 'auth/' + userId + '/otp/resend';
    return this.http.get(apiUrl, body);
  }

  verifyOTP(userId: any, body: any) {
    const apiUrl = 'users/' + userId + '/confirm/otp';
    return this.http.post(apiUrl, body);
  }

  verifyToken(token: string) {
    const apiUrl = `auth/login/token_login_validity?token=${token}`;
    return this.http.get(apiUrl);
  }

  forgotPasswordSendOtp(body: any) {
    const apiUrl = `auth/forgot/password`;
    return this.http.post(apiUrl, body);
  }

  forgotPasswordVerifyOtp(body: any) {
    const apiUrl = `users/reset/otp/confirm`;
    return this.http.post(apiUrl, body);
  }

  resetPassword(body: any) {
    const apiUrl = `users/password/reset`;
    return this.http.post(apiUrl, body);
  }
}
