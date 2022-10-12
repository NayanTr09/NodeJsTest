import { Action, createReducer, on } from '@ngrx/store';
import { logOutSuccess } from 'src/app/store/auth/auth.actions';
import { Option } from '../containers/documents-dropdown/documents-dropdown.component';
import { DocumentKycDetail } from '../models/KycDetail';
import * as kycFlowActions from './kyc-flow.actions';

export type MessageType = 'error' | 'success' | 'warning';
export interface CustomNotification {
    showMessage: boolean;
    message: string;
    messageType: MessageType;
}
export const EMPTY_NOTIFICATION: CustomNotification = {
    showMessage: false,
    message: '',
    messageType: 'warning'
}
export const EMPTY_DOCUMENT_KYC_DETAIL: DocumentKycDetail = {
    success: false,
    data: {
        document_1: null,
        document_2: null
    }
}
export const EMPTY_VERIFIED_INFO: VerifiedInfo = {
    status: 0,
    rejectionReason: '',
    verifiedAt: new Date()
}
export interface DocumentsBoolean {
    document_1: boolean;
    document_2: boolean;
}
export interface VerifiedInfo {
    status: number;
    rejectionReason: string;
    verifiedAt: Date;
}
export interface KycFlowState {
    isManualFlow: boolean;
    isSelfieEnable: boolean;
    step1Verified: boolean;
    isValidImage: boolean;
    alreadySavedImageUrl: string;
    showUiLoader: boolean;
    customNotification: CustomNotification,
    selectedBusinessStructure: number;
    documentKycDetail: DocumentKycDetail;
    documentsRequired: Array<Array<Option>>;
    documentsBeingEdited: DocumentsBoolean;
    documentsManualSubmit: DocumentsBoolean;
    kycStatusCode: number;
    verifiedInfo: VerifiedInfo[];
    companyType: string;
}
export const initialState: KycFlowState = {
    isManualFlow: false,
    isSelfieEnable: false,
    step1Verified: false,
    isValidImage: false,
    alreadySavedImageUrl: '',
    showUiLoader: false,
    customNotification: EMPTY_NOTIFICATION,
    selectedBusinessStructure: 0,
    documentKycDetail: EMPTY_DOCUMENT_KYC_DETAIL,
    documentsRequired: [[], []],
    documentsBeingEdited: { document_1: false, document_2: false },
    documentsManualSubmit: { document_1: false, document_2: false },
    kycStatusCode: 1,
    verifiedInfo: [EMPTY_VERIFIED_INFO, EMPTY_VERIFIED_INFO],
    companyType: ''
};
const kycFlowReducer = createReducer(
    initialState,
    on(kycFlowActions.ChangeIsManualFlowAction, (state, action) => ({ ...state, isManualFlow: action.isManulaFlow })),
    on(kycFlowActions.ChangeIsValidImageAction, (state, action) => ({ ...state, isValidImage: action.isValidImage })),
    on(kycFlowActions.ChangeShowUiLoaderAction, (state, action) => ({ ...state, showUiLoader: action.showUiLoader })),
    on(kycFlowActions.ChangeStep1VerifiedAction, (state, action) => ({ ...state, step1Verified: action.step1Verified })),
    on(kycFlowActions.ChangeIsSelfieEnableAction, (state, action) => ({ ...state, isSelfieEnable: action.isSelfieEnable })),
    on(kycFlowActions.ChangeAlreadySavedImageUrlAction, (state, action) => ({ ...state, alreadySavedImageUrl: action.alreadySavedImageUrl })),
    on(kycFlowActions.ChangeCustomNotificationAction, (state, action) => ({ ...state, customNotification: action.customNotification })),
    on(kycFlowActions.ChangeSelectedBusinessStructureAction, (state, action) => ({ ...state, selectedBusinessStructure: action.selectedBusinessStructure })),
    on(kycFlowActions.ChangeDocumentKycDetailAction, (state, action) => ({ ...state, documentKycDetail: action.documentKycDetail })),
    on(kycFlowActions.ChangeDocumentsRequiredAction, (state, action) => ({ ...state, documentsRequired: action.documentsRequired })),
    on(kycFlowActions.EditDocument1Action, (state) => ({ ...state, documentsBeingEdited: { document_1: true, document_2: false } })),
    on(kycFlowActions.EditDocument2Action, (state) => ({ ...state, documentsBeingEdited: { document_1: false, document_2: true } })),
    on(kycFlowActions.Document1ManualSubmitAction, (state) => ({ ...state, documentsManualSubmit: { document_1: true, document_2: state.documentsManualSubmit.document_2 } })),
    on(kycFlowActions.Document2ManualSubmitAction, (state) => ({ ...state, documentsManualSubmit: { document_1: state.documentsManualSubmit.document_1, document_2: true } })),
    on(kycFlowActions.ChangeKycStatusCodeAction, (state, action) => ({ ...state, kycStatusCode: action.kycStatusCode })),
    on(kycFlowActions.ChangeVerifiedInfoAction, (state, action) => ({ ...state, verifiedInfo: action.verifiedInfo })),
    on(kycFlowActions.ChangeCompanyTypeAction, (state, action) => ({ ...state, companyType: action.companyType })),
    on(kycFlowActions.ChangeDocumentsBeingEditedAction, (state, action) => ({ ...state, documentsBeingEdited: action.documentsBeingEdited })),
    on(kycFlowActions.ResetDocumentManualSubmitAction, (state) => ({ ...state, documentsManualSubmit: { document_1: false, document_2: false } })),
    on(kycFlowActions.ResetKycStateAction, () => initialState),
    on(logOutSuccess, () => initialState),
);

export function reducer(state: KycFlowState | undefined, action: Action) {
    return kycFlowReducer(state, action);
}