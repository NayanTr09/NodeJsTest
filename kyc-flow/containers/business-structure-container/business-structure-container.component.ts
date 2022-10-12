import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';
import { ResetKycStateAction } from '../../services/kyc-flow.actions';
import { KycFlowState } from '../../services/kyc-flow.reducer';
import { selectKycFlowState } from '../../services/kyc-flow.selectors';
import { KycFlowService } from '../../services/kyc-flow.service';
import { Option } from '../documents-dropdown/documents-dropdown.component';

interface Config {
  headerText: string;
  labelText: string;
}
const CONFIG = [
  { headerText: 'Company', labelText: 'Registered company as “LLP”, “Private”, “Public”, “Subsidiary”, “holding”, etc, under companies Act 2013.' },
  { headerText: 'Individual', labelText: 'A seller who is selling through online social platforms, and hasnot registered his/her firm under Companies Act 2013.' },
  { headerText: 'Sole Proprietorship', labelText: 'Registered company as “Sole Proprietor” under companies Act 2013.' },
]
const COMPANY_DROPDOWN_OPTIONS: string[] = ['Partnership', 'Limited Liability Partnership', 'Public Limited Company', 'Private Limited Company'];

@Component({
  selector: 'app-business-structure-container',
  templateUrl: './business-structure-container.component.html',
  styleUrls: ['./business-structure-container.component.scss'],
})
export class BusinessStructureContainerComponent implements OnInit {
  businessStructureForm: any;
  config: Config[] = CONFIG;
  showConfig: number[] = []
  dropDownOptions: Option[] = COMPANY_DROPDOWN_OPTIONS.map(val => ({ display: val, value: val }));
  companyType: string = this.dropDownOptions[0].value;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ngxLoader: NgxUiLoaderService,
    private store: Store,
    private kycFlowService: KycFlowService,
    private ga: GoogleAnalyticsService
  ) {
    this.kycFlowService.callIsSelfieEnable().subscribe();
    this.kycFlowService.dispatchChangeSelectedBusinessStructureAction(this.kycFlowService.fetchBusinessStructureFromUrl());
    this.store.select(selectKycFlowState).subscribe((kycFlowState: KycFlowState) => {
      const init = kycFlowState.selectedBusinessStructure;
      this.businessStructureForm = this.fb.group({
        businessStructure: [init, [Validators.required]],
      });
      this.showConfig = [0, 1, 2];
      if (kycFlowState.verifiedInfo[0].status === 0 && kycFlowState.verifiedInfo[1].status === 0) {
        this.showConfig = [0, 1, 2];
      }
      else if (kycFlowState.verifiedInfo[0].status === 0) {
        this.showConfig = [0, 2];
      } else if (kycFlowState.verifiedInfo[1].status === 0) {
        this.showConfig = [1];
      }
    });
  }

  show(index: number) {
    return this.showConfig.indexOf(index) !== -1;
  }

  ngOnInit(): void {
  }

  goBack() {
    this.store.dispatch(ResetKycStateAction());
    this.router.navigateByUrl('/orders/list');
  }

  onSubmit() {
    this.ngxLoader.start('business-structure-submit');
    const body = {
      businessStructure: this.businessStructureForm.controls[
        'businessStructure'
      ].value,
    };
    if (body.businessStructure === 3) {
      this.companyType = CONFIG[2].headerText;
    }
    switch(body.businessStructure) {
      case 1:
        this.ga.eventEmitter('Clicked on Company', 'Shipments Detail');
        break;
      case 2:
        this.ga.eventEmitter('Clicked on Individual', 'Shipments Detail');
        break;
      case 3:
        this.ga.eventEmitter('Clicked on Sole Proprietor', 'Shipments Detail');
        break;
    }
    this.kycFlowService.dispatchChangeCompanyTypeAction(this.companyType);
    this.kycFlowService.dispatchChangeSelectedBusinessStructureAction(body.businessStructure);
    setTimeout(() => {
      this.ngxLoader.stop('business-structure-submit');
      this.router.navigateByUrl(
        `/kyc-flow/${body.businessStructure}/photo-identification`
      );
    }, 2000);
  }
  removeFocus() {
    (<HTMLInputElement>document.getElementById('dummy')).focus();
  }

  showDropdown(index: number) {
    return index === 0 && this.businessStructureForm.value.businessStructure === 1;
  }

  companyTypeSelectionHandler(event: Option) {
    this.companyType = event.value;
  }
}
