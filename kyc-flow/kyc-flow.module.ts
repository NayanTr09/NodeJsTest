import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../shared/shared.module';

import { ThankYouContainerComponent } from './containers/thank-you-container/thank-you-container.component';
import { KycFlowContainerComponent } from './containers/kyc-flow-container/kyc-flow-container.component';
import { BusinessStructureContainerComponent } from './containers/business-structure-container/business-structure-container.component';
import { VerifyDocumentsContainerComponent } from './containers/verify-documents-container/verify-documents-container.component';
import { PhotoIdentificationContainerComponent } from './containers/photo-identification-container/photo-identification-container.component';
import { VerifyButtonContainerComponent } from './containers/verify-button-container/verify-button-container.component';
import { AadharCardOtpGeneratorComponent } from './containers/aadhar-gstin-otp-generator/aadhar-gstin-otp-generator.component';
import { DocumentsDropdownComponent } from './containers/documents-dropdown/documents-dropdown.component';
import { DocumentInputCardComponent } from './containers/document-input-card/document-input-card.component';
import { KycSuccessContainerComponent } from './containers/kyc-success-container/kyc-success-container.component';
import { VerifiedContainerComponent } from './containers/verified-container/verified-container.component';

const shipmentsRoutes: Routes = [
  {
    path: '',
    component: KycFlowContainerComponent,
    children: [
      {
        path: 'business-structure',
        component: BusinessStructureContainerComponent,
      },
      {
        path: ':type/photo-identification',
        component: PhotoIdentificationContainerComponent,
      },
      {
        path: ':type/verify-documents',
        component: VerifyDocumentsContainerComponent,
      },
      {
        path: ':type/verified',
        component: VerifiedContainerComponent
      },
      {
        path: ':type/thank-you',
        component: ThankYouContainerComponent,
      },
      {
        path: '',
        redirectTo: 'business-structure',
      },
    ],
  },
];

@NgModule({
  declarations: [
    ThankYouContainerComponent,
    KycFlowContainerComponent,
    BusinessStructureContainerComponent,
    VerifyDocumentsContainerComponent,
    PhotoIdentificationContainerComponent,
    VerifyButtonContainerComponent,
    AadharCardOtpGeneratorComponent,
    DocumentsDropdownComponent,
    DocumentInputCardComponent,
    KycSuccessContainerComponent,
    VerifiedContainerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    InfiniteScrollModule,
    RouterModule.forChild(shipmentsRoutes),
  ],
  exports: [
    RouterModule,
    ThankYouContainerComponent,
    KycFlowContainerComponent,
    BusinessStructureContainerComponent,
    VerifyDocumentsContainerComponent,
    PhotoIdentificationContainerComponent,
  ],
})
export class KycFlowModule {}
