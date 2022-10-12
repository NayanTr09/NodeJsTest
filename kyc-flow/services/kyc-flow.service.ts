import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import { Option } from '../containers/documents-dropdown/documents-dropdown.component';
import { AadharGstApiResponse } from '../models/AadharGstApiResponse';
import { CheckLivelinessResponse } from '../models/CheckLivelinessResponse';
import { DocData, DocListResponse } from '../models/DocListResponse';
import { ImageKyc, IsSelfieEnableResponse, KycDetail } from '../models/IsSelfieEnableResponse';
import { DocumentKycDetail } from '../models/KycDetail';
import { SaveKycResponse } from '../models/SaveKycResponse';
import { UploadDocumentResponse } from '../models/UploadDocumentResponse';
import { ChangeAlreadySavedImageUrlAction, ChangeCompanyTypeAction, ChangeCustomNotificationAction, ChangeDocumentKycDetailAction, ChangeDocumentsBeingEditedAction, ChangeDocumentsRequiredAction, ChangeIsManualFlowAction, ChangeIsSelfieEnableAction, ChangeIsValidImageAction, ChangeKycStatusCodeAction, ChangeSelectedBusinessStructureAction, ChangeStep1VerifiedAction, ChangeVerifiedInfoAction, Document1ManualSubmitAction, Document2ManualSubmitAction, ResetDocumentManualSubmitAction } from './kyc-flow.actions';
import { DocumentsBoolean, EMPTY_NOTIFICATION, KycFlowState, MessageType, VerifiedInfo } from './kyc-flow.reducer';
import { selectKycFlowState } from './kyc-flow.selectors';

@Injectable({
  providedIn: 'root',
})
export class KycFlowService {
  kycFlowState: KycFlowState = {} as KycFlowState;
  constructor(private http: HttpService, private store: Store, private toastr: ToastrService) {
    store.select(selectKycFlowState).subscribe((kycFlowState: KycFlowState) => {
      this.kycFlowState = kycFlowState;
    })
  }
  fetchBusinessStructureFromUrl(): number {
    const pathname = new URL(window.location.href).pathname;
    const businessStructure = parseInt(pathname[pathname.lastIndexOf('/kyc-flow') + 10]);
    this.dispatchChangeSelectedBusinessStructureAction(businessStructure);
    return businessStructure;
  }
  generateAadharOtp(obj: any): Observable<AadharGstApiResponse> {
    const apiUrl = 'settings/kyc/generate-aadhar-otp';
    return this.handleError(this.http.post(apiUrl, obj));
  }
  generateGstinOtp(obj: any): Observable<AadharGstApiResponse> {
    const apiUrl = 'settings/kyc/generate-gst-otp';
    return this.handleError(this.http.post(apiUrl, obj));
  }
  verifyAadharOtp(obj: any): Observable<AadharGstApiResponse> {
    const apiUrl = 'settings/kyc/verify-aadhar-otp';
    return this.handleError(this.http.post(apiUrl, obj));
  }
  verifyGstinOtp(obj: any): Observable<AadharGstApiResponse> {
    const apiUrl = 'settings/kyc/verify-gst-otp';
    return this.handleError(this.http.post(apiUrl, obj));
  }
  getDocList(documentNumber: number, kycType: number): Observable<DocListResponse> {
    const apiUrl = `settings/kyc/doc-list?document_number=${documentNumber}&kyc_type=${kycType}`;
    let obs = this.http.get(apiUrl);
    if (documentNumber === 1 && kycType === 1) {
      obs = of({
        data: [{ name: "Pan Card", value: "pan" }],
        success: true
      });
    }
    return obs.pipe(
      map((docList: DocListResponse) => {
        const docsArr = docList.data.map((doc: DocData) => {
          return {
            display: doc.name,
            value: doc.value,
          };
        }) as [];
        if (documentNumber === 1) {
          this.dispatchChangeDocumentsRequiredAction([docsArr, this.kycFlowState.documentsRequired[1]]);
        } else {
          this.dispatchChangeDocumentsRequiredAction([this.kycFlowState.documentsRequired[0], docsArr]);
        }
        return docList;
      })
    )
  }
  getKycDetail(): Observable<DocumentKycDetail> {
    const apiUrl = 'settings/kyc/kyc-detail';
    const saveObj = {
      document_type: 'document',
      kyc_type: this.fetchBusinessStructureFromUrl()
    }
    return this.http.post(apiUrl, saveObj).pipe(
      map((documentKycDetail: DocumentKycDetail) => {
        this.dispatchChangeDocumentKycDetailAction(documentKycDetail);
        this.store.dispatch(ResetDocumentManualSubmitAction());
        if (documentKycDetail.data.document_1?.image_url !== '' && documentKycDetail.data.document_1?.is_verified === false) {
          this.store.dispatch(Document1ManualSubmitAction());
        }
        if (documentKycDetail.data.document_2?.image_url !== '' && documentKycDetail.data.document_2?.is_verified === false) {
          this.store.dispatch(Document2ManualSubmitAction());
        }
        const documentsBeingEdited: DocumentsBoolean = { document_1: true, document_2: true } as DocumentsBoolean;
        if (documentKycDetail.data.document_1 !== null) {
          documentsBeingEdited.document_1 = false;
          if (documentKycDetail.data.document_1.number === "") {
            documentsBeingEdited.document_1 = true;
          }
        }
        if (documentKycDetail.data.document_2 !== null) {
          documentsBeingEdited.document_2 = false;
          if (documentKycDetail.data.document_2.number === "") {
            documentsBeingEdited.document_2 = true;

          }
        }
        this.dispatchChangeDocumentsBeingEditedAction(documentsBeingEdited);
        return documentKycDetail;
      })
    );
  }
  uploadDocument(obj: any): Observable<UploadDocumentResponse> {
    let apiUrl = 'settings/kyc/upload-document';
    const isManual = obj.get('document_number') == 1 ? this.kycFlowState.documentsManualSubmit.document_1 : this.kycFlowState.documentsManualSubmit.document_2;
    if (isManual) {
      apiUrl = 'settings/kyc/upload-document-log';
    }
    return this.http.post(apiUrl, obj).pipe(
      map((resp: UploadDocumentResponse) => {
        this.showNotification(resp.success && !resp.is_manual ? 'success' : 'warning', resp.message);
        if (resp.success) {
          this.getKycDetail().subscribe();
        }
        return resp;
      },
        catchError(error => {
          if (error?.error?.message) {
            this.toastr.error(error.error.message);
          } else {
            this.toastr.error(error);
          }
          return of({});
        }))
    );
  }
  dispatchChangeIsValidImageAction(isValidImage: boolean) {
    this.store.dispatch(ChangeIsValidImageAction({ isValidImage: isValidImage }));
  }
  dispatchChangeIsManualFlowAction(isManualFlow: boolean) {
    this.store.dispatch(ChangeIsManualFlowAction({ isManulaFlow: isManualFlow }));
  }
  dispatchChangeStep1VerifiedAction(step1Verified: boolean) {
    this.store.dispatch(ChangeStep1VerifiedAction({ step1Verified: step1Verified }));
  }
  dispatchChangeIsSelfieEnableAction(isSelfieEnable: boolean) {
    this.store.dispatch(ChangeIsSelfieEnableAction({ isSelfieEnable: isSelfieEnable }));
  }
  dispatchChangeAlreadySavedImageUrlAction(imageUrl: string) {
    this.store.dispatch(ChangeAlreadySavedImageUrlAction({ alreadySavedImageUrl: imageUrl }));
  }
  dispatchChangeSelectedBusinessStructureAction(selectedBusinessStructure: number) {
    this.store.dispatch(ChangeSelectedBusinessStructureAction({ selectedBusinessStructure: selectedBusinessStructure }));
  }
  dispatchChangeDocumentKycDetailAction(documentKycDetail: DocumentKycDetail) {
    this.store.dispatch(ChangeDocumentKycDetailAction({ documentKycDetail: documentKycDetail }));
  }
  dispatchChangeDocumentsRequiredAction(documentsRequired: Array<Array<Option>>) {
    this.store.dispatch(ChangeDocumentsRequiredAction({ documentsRequired: documentsRequired }));
  }
  dispatchChangeKycStatusCodeAction(kycStatusCode: number) {
    this.store.dispatch(ChangeKycStatusCodeAction({ kycStatusCode: kycStatusCode }));
  }
  dispatchChangeVerifiedInfoAction(verifiedInfo: VerifiedInfo[]) {
    this.store.dispatch(ChangeVerifiedInfoAction({ verifiedInfo: verifiedInfo }));
  }
  dispatchChangeCompanyTypeAction(companyType: string) {
    this.store.dispatch(ChangeCompanyTypeAction({ companyType: companyType }));
  }
  dispatchChangeDocumentsBeingEditedAction(documentsBeingEdited: DocumentsBoolean) {
    this.store.dispatch(ChangeDocumentsBeingEditedAction({ documentsBeingEdited: documentsBeingEdited }));
  }
  checkLiveliness(obj: FormData): Observable<CheckLivelinessResponse> {
    const apiUrl = 'settings/kyc/is-live-image';
    return this.http.post(apiUrl, obj).pipe(
      map((resp: CheckLivelinessResponse) => {
        this.callIsSelfieEnable().subscribe();
        if (resp.success && resp.aadhaar_enable && resp.gst_enable) {
          this.showNotification('success', resp.message);
        } else if (!resp.success || resp.success && !resp.aadhaar_enable) {
          this.showNotification('warning', resp.message);
        }
        return resp;
      })
    )
  }
  showNotification(type: MessageType, message: string, timeOut: number = 2000): void {
    this.store.dispatch(ChangeCustomNotificationAction({
      customNotification: {
        message: message,
        messageType: type,
        showMessage: true
      }
    }));
    setTimeout(() => {
      this.store.dispatch(ChangeCustomNotificationAction({ customNotification: EMPTY_NOTIFICATION }));
    }, timeOut);
  }
  callIsSelfieEnable(): Observable<IsSelfieEnableResponse> {
    const apiUrl = 'settings/kyc/is-selfie-enable?is_web=1';
    return this.http.get(apiUrl).pipe(
      map((resp: IsSelfieEnableResponse) => {
        const step_1_kyc: ImageKyc = this.fetchBusinessStructureFromUrl() === 2 ? resp.step_1_verification.kyc_2 : resp.step_1_verification.kyc_1;
        const step_2_kyc: KycDetail = this.fetchBusinessStructureFromUrl() === 2 ? resp.kyc_saved_details[2] : resp.kyc_saved_details[1];
        this.dispatchChangeIsSelfieEnableAction(resp.selfie_enable);
        this.dispatchChangeIsManualFlowAction(!resp.selfie_enable && step_1_kyc.verified && step_1_kyc.is_valid === 0);
        this.dispatchChangeIsValidImageAction(step_1_kyc.verified && step_1_kyc.is_valid === 1 || step_1_kyc.is_valid == true);
        this.dispatchChangeStep1VerifiedAction(step_1_kyc.verified);
        if (step_1_kyc.company_type) {
          this.dispatchChangeCompanyTypeAction(step_1_kyc.company_type);
        }
        if (step_1_kyc.verified) {
          this.dispatchChangeAlreadySavedImageUrlAction(step_1_kyc.image);
        }
        if (step_2_kyc.status) {
          this.dispatchChangeKycStatusCodeAction(step_2_kyc.status);
        }
        this.dispatchChangeVerifiedInfoAction([
          {
            status: this.getStatus(resp.kyc_saved_details[1].status),
            rejectionReason: resp.kyc_saved_details[1].rejection_reason,
            verifiedAt: new Date(resp.kyc_saved_details[1].verified_at)
          },
          {
            status: this.getStatus(resp.kyc_saved_details[2].status),
            rejectionReason: resp.kyc_saved_details[2].rejection_reason,
            verifiedAt: new Date(resp.kyc_saved_details[2].verified_at)
          }
        ])
        return resp;
      })
    );
  }
  getStatus(status: number): number {
    return typeof status === 'string' ? 0 : status;
  }
  saveKyc(kycWithOtp: boolean): Observable<SaveKycResponse> {
    const apiUrl = 'settings/kyc/save-kyc';
    const saveObj = {
      'kyc_type': this.fetchBusinessStructureFromUrl(),
      'kyc_with_otp': kycWithOtp,
      'company_type': this.kycFlowState.companyType
    }
    return this.handleError(this.http.post(apiUrl, saveObj));
  }
  handleError(obs: Observable<any>): Observable<any> {
    return obs.pipe(
      map((resp) => {
        this.showNotification(resp.success ? 'success' : 'warning', resp.message);
        return resp;
      },
        catchError(error => {
          if (error?.error?.message) {
            this.toastr.error(error.error.message);
          } else {
            this.toastr.error(error);
          }
          return of({});
        }))
    );
  }
}
