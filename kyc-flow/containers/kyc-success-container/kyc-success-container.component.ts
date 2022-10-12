import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';
import { KYC_SUCCESS_TYPES } from 'src/app/shared/constants/constants';
import { ResetKycStateAction } from '../../services/kyc-flow.actions';

@Component({
  selector: 'app-kyc-success-container',
  templateUrl: './kyc-success-container.component.html',
  styleUrls: ['./kyc-success-container.component.scss'],
})
export class KycSuccessContainerComponent implements OnInit {
  @Input() kycSuccesType = KYC_SUCCESS_TYPES[0];
  isImmediateSuccess() {
    return this.kycSuccesType === KYC_SUCCESS_TYPES[0];
  }
  isUnderReview() {
    return this.kycSuccesType === KYC_SUCCESS_TYPES[1];
  }
  constructor(private router: Router, private store: Store, private ga: GoogleAnalyticsService) {}
  ngOnInit(): void {
    this.ga.eventEmitter('KYC Success page view', 'KYC Success page');
  }
  goToMyOrders() {
    this.store.dispatch(ResetKycStateAction());
    this.router.navigateByUrl('/orders/list');
  }
}
