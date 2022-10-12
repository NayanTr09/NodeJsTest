import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { setFooterState } from 'src/app/store/auth/auth.actions';
import { KycFlowService } from '../../services/kyc-flow.service';

@Component({
  selector: 'app-kyc-flow-container',
  templateUrl: './kyc-flow-container.component.html',
  styleUrls: ['./kyc-flow-container.component.scss'],
})
export class KycFlowContainerComponent implements OnInit, OnDestroy {
  constructor(private kycFlowService: KycFlowService, private store: Store) {
    this.kycFlowService.callIsSelfieEnable().subscribe();
    this.store.dispatch(setFooterState({ value: true }));
    document.body.style.backgroundColor = 'transparent';
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.store.dispatch(setFooterState({ value: false }));
  }
}
