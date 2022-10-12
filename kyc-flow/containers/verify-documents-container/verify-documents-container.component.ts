import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DocumentViewModel } from '../../models/DocumentViewModel';
import { DocumentKycDetail } from '../../models/KycDetail';
import { SaveKycResponse } from '../../models/SaveKycResponse';
import { UploadDocumentResponse } from '../../models/UploadDocumentResponse';
import { EMPTY_DOCUMENT_KYC_DETAIL, KycFlowState } from '../../services/kyc-flow.reducer';
import { selectKycFlowState } from '../../services/kyc-flow.selectors';
import { KycFlowService } from '../../services/kyc-flow.service';
export const PAGE_TYPES = [
  'VERIFICATION_PAGE',
  'AADHAR_PAGE',
  'MANUAL_KYC_PAGE',
  'GSTIN_PAGE',
  'KYC_VERIFIED_PAGE',
];
export const KYC_MAPPING = {
  aadhar: {
    titleText: 'Express KYC',
    buttonText: 'Verify Using Aadhaar Card',
    footerText: 'Get KYC verified in 30 seconds',
  },
  gstin: {
    titleText: 'Express KYC',
    buttonText: 'Verify Using GSTIN',
    footerText: 'Get KYC verified in 30 seconds',
  },
  document_verification: {
    titleText: 'Manual KYC',
    buttonText: 'Documents Verification',
    footerText:
      'Please note that Manual KYC will take upto 2-3 business days to get verified',
  }
};
@Component({
  selector: 'app-verify-documents-container',
  templateUrl: './verify-documents-container.component.html',
  styleUrls: ['./verify-documents-container.component.scss'],
})
export class VerifyDocumentsContainerComponent implements OnInit {
  constructor(private kycFlowService: KycFlowService, private ngxLoader: NgxUiLoaderService,
    private router: Router, private store: Store) {
  }
  optionalDocumentsToVerify: DocumentViewModel[] = [];
  businessStructure: number = 1;
  headerText: string = '';
  pageType: string = PAGE_TYPES[0];
  kycVerified = false;
  documentKycDetail: DocumentKycDetail = EMPTY_DOCUMENT_KYC_DETAIL;
  isSecondInputCardDisabled: boolean = false;
  ngOnInit(): void {
    this.businessStructure = this.kycFlowService.fetchBusinessStructureFromUrl();
    this.kycFlowService.getKycDetail().subscribe();
    this.kycFlowService.callIsSelfieEnable().subscribe(() => {
      this.store.select(selectKycFlowState).subscribe((kycFlowState: KycFlowState) => {
        if (!kycFlowState.step1Verified) {
          this.goBack();
        }
        if (kycFlowState.isManualFlow) {
          this.optionalDocumentsToVerify = this.optionalDocumentsToVerify.filter((options: DocumentViewModel) =>
            options.buttonText !== KYC_MAPPING.aadhar.buttonText && options.buttonText !== KYC_MAPPING.gstin.buttonText
          );
        }
        this.isSecondInputCardDisabled = kycFlowState.documentsBeingEdited.document_1;
        this.documentKycDetail = kycFlowState.documentKycDetail;
      })
    });
    this.fetchDocList(this.businessStructure);
    switch (this.businessStructure) {
      case 1:
        this.headerText = 'KYC - Company';
        this.optionalDocumentsToVerify = [
          KYC_MAPPING.gstin, KYC_MAPPING.document_verification
        ];
        break;
      case 2:
        this.headerText = 'KYC - Individual';
        this.optionalDocumentsToVerify = [
          KYC_MAPPING.aadhar, KYC_MAPPING.document_verification
        ];
        break;
      case 3:
        this.headerText = 'KYC - Sole Proprietor';
        this.optionalDocumentsToVerify = [
          KYC_MAPPING.aadhar, KYC_MAPPING.gstin, KYC_MAPPING.document_verification
        ];
        break;
    }
  }
  goBack() {
    if (this.isVerificationPage()) {
      this.router.navigate([`/kyc-flow/${this.businessStructure}/photo-identification`]);
    } else {
      this.verificationPage();
    }
  }
  isLastDocument(index: number) {
    return index === this.optionalDocumentsToVerify.length - 1;
  }
  isVerificationPage() {
    return this.pageType === PAGE_TYPES[0];
  }
  isAadharPage() {
    return this.pageType === PAGE_TYPES[1];
  }
  isManualKycPage() {
    return this.pageType === PAGE_TYPES[2];
  }
  isGstinPage() {
    return this.pageType === PAGE_TYPES[3];
  }
  isKycVerifiedPage() {
    return this.pageType === PAGE_TYPES[4];
  }
  verifyAadhar() {
    this.pageType = PAGE_TYPES[1];
  }
  verificationPage() {
    this.pageType = PAGE_TYPES[0];
  }
  verifyByManualKyc() {
    this.pageType = PAGE_TYPES[2];
  }
  verifyByGstin() {
    this.pageType = PAGE_TYPES[3];
  }
  verifyKyc() {
    this.kycFlowService.saveKyc(false).subscribe((resp: SaveKycResponse) => {
      if (resp.success) {
        this.pageType = PAGE_TYPES[4];
      }
    })
  }
  verifyButtonClickHandler(document: DocumentViewModel) {
    if (document.buttonText === 'Verify Using Aadhaar Card') {
      this.verifyAadhar();
    } else if (document.buttonText === 'Documents Verification') {
      this.verifyByManualKyc();
    } else if (document.buttonText === 'Verify Using GSTIN') {
      this.verifyByGstin();
    }
  }
  noFileSelected() {
    return (
      (<HTMLInputElement>document.getElementById('image1'))?.value === '' ||
      (<HTMLInputElement>document.getElementById('image2'))?.value
    );
  }
  documentSubmitEventHandler(event: FormData) {
    const saveObj: FormData = event;
    saveObj.append('kyc_type', this.businessStructure.toString());
    this.ngxLoader.start('uploadDocument');
    this.kycFlowService.uploadDocument(saveObj).subscribe(
      (response: UploadDocumentResponse) => {
        console.log(response);
        this.fetchDocList(this.businessStructure);
        this.ngxLoader.stop('uploadDocument');
      },
      (error) => {
        console.log(error);
        this.ngxLoader.stop('uploadDocument');
      }
    );
  }
  fetchDocList(kycType: number) {
    this.kycFlowService.getDocList(1, kycType).subscribe();
    this.kycFlowService.getDocList(2, kycType).subscribe();
  }
  getManualKycDocument() {
    return this.optionalDocumentsToVerify.filter(
      (doc) => doc.titleText === 'Manual KYC'
    )[0];
  }
}
