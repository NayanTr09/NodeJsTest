import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { setFooterState } from 'src/app/store/auth/auth.actions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-help-container',
  templateUrl: './help-container.component.html',
  styleUrls: ['./help-container.component.scss']
})
export class HelpContainerComponent implements OnInit, OnDestroy {

  constructor(private store: Store, private router: Router) {
    this.store.dispatch(setFooterState({ value: true }));
  }

  ngOnInit(): void {
    document.body.style.backgroundColor = 'white';
  }

  getUrlWithToken(): string {
    return environment.production
      ? `https://app.shiprocket.in`
      : `http://app.shiprocket.local` +
      `/login?token=${localStorage.getItem('AUTH_TOKEN')}`;
  }

  ngOnDestroy(): void {
    this.store.dispatch(setFooterState({ value: false }));
  }

  goBack() {
    this.router.navigateByUrl('/orders/list');
  }
}
