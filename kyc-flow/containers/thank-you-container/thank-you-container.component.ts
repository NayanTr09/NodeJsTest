import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ResetKycStateAction } from '../../services/kyc-flow.actions';

@Component({
  selector: 'app-thank-you-container',
  templateUrl: './thank-you-container.component.html',
  styleUrls: ['./thank-you-container.component.scss'],
})
export class ThankYouContainerComponent implements OnInit {
  constructor(private router: Router, private store: Store) {}

  ngOnInit(): void {}

  goBack() {
    this.store.dispatch(ResetKycStateAction());
    this.router.navigateByUrl('/orders/list');
  }
}
