import { createAction, props } from '@ngrx/store';
import { Option } from '../containers/documents-dropdown/documents-dropdown.component';
import { DocumentKycDetail } from '../models/KycDetail';
import { CustomNotification, DocumentsBoolean, VerifiedInfo } from './kyc-flow.reducer';

export const ChangeIsManualFlowAction = createAction(
    '[KYC FLOW STATE] Change IsManual Flow Action',
    props<{ isManulaFlow: boolean }>()
);

export const ChangeIsValidImageAction = createAction(
    '[KYC FLOW STATE] Change Is Valid Image Action',
    props<{ isValidImage: boolean }>()
);

export const ChangeShowUiLoaderAction = createAction(
    '[KYC FLOW STATE] Change Show UI Loader Action',
    props<{ showUiLoader: boolean }>()
);

export const ChangeStep1VerifiedAction = createAction(
    '[KYC FLOW STATE] Change Step 1 Verified Action',
    props<{ step1Verified: boolean }>()
);

export const ChangeIsSelfieEnableAction = createAction(
    '[KYC FLOW STATE] Change Is Selfie Enable Action',
    props<{ isSelfieEnable: boolean }>()
);

export const ChangeAlreadySavedImageUrlAction = createAction(
    '[KYC FLOW STATE] Change Already Saved Image Url Action',
    props<{ alreadySavedImageUrl: string }>()
);

export const ChangeCustomNotificationAction = createAction(
    '[KYC FLOW STATE] Change Custom Notification Action',
    props<{ customNotification: CustomNotification }>()
);

export const ChangeSelectedBusinessStructureAction = createAction(
    '[KYC FLOW STATE] Change Selected Business Structure Action',
    props<{ selectedBusinessStructure: number }>()
);

export const ChangeDocumentKycDetailAction = createAction(
    '[KYC FLOW STATE] Change Document Kyc Detail Action',
    props<{ documentKycDetail: DocumentKycDetail }>()
);

export const ChangeDocumentsRequiredAction = createAction(
    '[KYC FLOW STATE] Change Documents Required Action',
    props<{ documentsRequired: Array<Array<Option>> }>()
);

export const EditDocument1Action = createAction(
    '[KYC FLOW STATE] Edit Document1 Action'
);

export const EditDocument2Action = createAction(
    '[KYC FLOW STATE] Edit Document2 Action'
);

export const Document1ManualSubmitAction = createAction(
    '[KYC FLOW STATE] Document1 Manual Submit Action'
);

export const Document2ManualSubmitAction = createAction(
    '[KYC FLOW STATE] Document2 Manual Submit Action'
);

export const ResetDocumentManualSubmitAction = createAction(
    '[KYC FLOW STATE] Reset Document Manula Submit Action'
);

export const ChangeKycStatusCodeAction = createAction(
    '[KYC FLOW STATE] Change Kyc Status Code Action',
    props<{ kycStatusCode: number }>()
)

export const ChangeVerifiedInfoAction = createAction(
    '[KYC FLOW STATE] Change Verified Info Action',
    props<{ verifiedInfo: VerifiedInfo[] }>()
)

export const ChangeCompanyTypeAction = createAction(
    '[KYC FLOW STATE] Change Company Type Action',
    props<{ companyType: string }>()
)

export const ChangeDocumentsBeingEditedAction = createAction(
    '[KYC FLOW STATE] Change Documents Being Edited Action',
    props<{ documentsBeingEdited: DocumentsBoolean }>()
);

export const ResetKycStateAction = createAction(
    '[KYC FLOW STATE] Reset Kyc State Action'
);