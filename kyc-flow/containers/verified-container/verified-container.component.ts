import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ResetKycStateAction } from '../../services/kyc-flow.actions';
import { KycFlowState } from '../../services/kyc-flow.reducer';
import { selectKycFlowState } from '../../services/kyc-flow.selectors';
import { KycFlowService } from '../../services/kyc-flow.service';
const CONFIG = {
  headerText: [
    'KYC - Company',
    'KYC - Individual',
    'KYC - Sole Proprietor'
  ],
  planeText: [
    'a Company',
    'an Individual',
    'a Sole Proprietor'
  ],
  buttonText: [
    'Verify KYC as a Company',
    'Verify KYC as an Individual',
    'Verify KYC as Sole Proprietor'
  ],
}
const STATUS_MAPPING = [
  'DEFAULT', 'PENDING', 'VERIFIED', 'REJECTED', 'REAPPLY', 'AADHAR_VERIFIED', 'GST_VERIFIED', 'AUTO_VERIFIED'
]
const COLORED_CARD_CLASS_MAPPING = ['colored-card-green', 'colored-card-orange', 'colored-card-red'];
const COLORED_STATUS_MAPPING = ['status-green', 'status-orange', 'status-red'];
@Component({
  selector: 'app-verified-container',
  templateUrl: './verified-container.component.html',
  styleUrls: ['./verified-container.component.scss']
})
export class VerifiedContainerComponent implements OnInit {
  businessStructure: number = 1;
  headerText: string = '';
  planeText: string[] = ['', ''];
  buttonText: string[] = ['', ''];
  kycFlowState: KycFlowState = {} as KycFlowState;
  kycStatus: string = '';
  verifiedOn: Date = new Date();
  constructor(private kycFlowService: KycFlowService, private store: Store, private ngxLoader: NgxUiLoaderService) {
  }

  ngOnInit(): void {
    this.kycFlowService.callIsSelfieEnable().subscribe();
    this.businessStructure = this.kycFlowService.fetchBusinessStructureFromUrl();
    this.store.select(selectKycFlowState).subscribe((kycFlowState: KycFlowState) => {
      this.kycFlowState = kycFlowState;
      this.businessStructure = kycFlowState.selectedBusinessStructure === 2 ? 2 : 1;
      this.kycStatus = STATUS_MAPPING[kycFlowState.verifiedInfo[this.businessStructure - 1].status];
      this.verifiedOn = kycFlowState.verifiedInfo[this.businessStructure - 1].verifiedAt;
      if(this.verifiedOn.getTime() != this.verifiedOn.getTime()) {
        this.verifiedOn = new Date();
      }
      this.headerText = CONFIG.headerText[this.businessStructure - 1];
      const remove = this.businessStructure === 2 ? [1] : [0, 2];
      this.planeText = CONFIG.planeText.filter(text => remove.indexOf(CONFIG.planeText.indexOf(text)) === -1);
      this.buttonText = CONFIG.buttonText.filter(text => remove.indexOf(CONFIG.buttonText.indexOf(text)) === -1);
    });
  }

  goBack() {
    this.store.dispatch(ResetKycStateAction());
    window.open('/orders/list', '_self');
  }

  buttonClickHandler(buttonText: string) {
    this.ngxLoader.start('business-structure-redirect');
    const bs = 1 + CONFIG.buttonText.indexOf(buttonText) === 2 ? 2 : 1;
    // this.store.dispatch(ChangeSelectedBusinessStructureAction({ selectedBusinessStructure: bs }));
    if ([2, 5, 6, 7].indexOf(this.kycFlowState.verifiedInfo[bs - 1].status) !== -1) {
      window.open(
        `/kyc-flow/${bs}/verified`, '_self'
      );
    } else {
      window.open(
        `/kyc-flow/business-structure`, '_self'
      );
    }
    setTimeout(() => {
      this.ngxLoader.stop('business-structure-redirect');
    }, 2000);
  }

  getColorIndex(): number {
    const bs = this.kycFlowState.selectedBusinessStructure === 2 ? 1 : 0;
    const status = this.kycFlowState.verifiedInfo[bs].status;
    if ([2, 5, 6, 7].indexOf(status) !== -1) {
      return 0;
    }
    if ([1, 4].indexOf(status) !== -1) {
      return 1;
    }
    return 2;
  }

  getColoredCardClass(index: number): string {
    return COLORED_CARD_CLASS_MAPPING[index];
  }

  getColoredStatusClass(index: number): string {
    return COLORED_STATUS_MAPPING[index];
  }

  isRejected(): boolean {
    return this.kycStatus === STATUS_MAPPING[3];
  }

  getRejectReason(): string {
    const bs = this.kycFlowState.selectedBusinessStructure === 2 ? 1 : 0;
    return this.kycFlowState.verifiedInfo[bs].rejectionReason;
  }
}
