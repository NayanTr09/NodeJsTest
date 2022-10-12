import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { KycDocument } from '../../models/KycDetail';
import { EditDocument1Action, EditDocument2Action } from '../../services/kyc-flow.actions';
import { KycFlowState } from '../../services/kyc-flow.reducer';
import { selectKycFlowState } from '../../services/kyc-flow.selectors';
import { Option } from '../documents-dropdown/documents-dropdown.component';
const DOCS_FOR_WHICH_ONLY_FRONT_IS_NEEDED = ['pan', 'cin'];
const DROPDOWN_PLACEHOLDER = 'Select Document Type';
interface FileData {
  imageUrl: string | ArrayBuffer | null;
  file: any | null;
}
const EMPTY_FILE = { imageUrl: '', file: null };
@Component({
  selector: 'app-document-input-card',
  templateUrl: './document-input-card.component.html',
  styleUrls: ['./document-input-card.component.scss'],
})
export class DocumentInputCardComponent implements OnInit {
  @Input() index = 3;
  @Input() disabled = false;
  @Input() documentsRequired: Array<Array<Option>> = [[], []];
  @Output() documentSubmitEvent = new EventEmitter();
  documentType = '';
  numberOfImagesToUpload = 2;
  textForImageUpload = ['Upload Images Front Side', 'Upload Images Back Side'];
  submitButtonDisabled = true;
  files: FileData[] = [EMPTY_FILE, EMPTY_FILE];
  url: any = '';
  isBeingEdited = false;
  alreadySavedDocument: KycDocument | null = null;
  documentManualSubmit: boolean = false;
  documentNumber: string = '';
  documentName: string = '';
  kycFlowState: KycFlowState = {} as KycFlowState;
  showRecordsMismatchText: boolean = false;
  constructor(private store: Store) { }
  ngOnInit(): void {
    this.store.select(selectKycFlowState).subscribe((kycFlowState: KycFlowState) => {
      this.kycFlowState = kycFlowState;
      this.documentsRequired = kycFlowState.documentsRequired;
      this.isBeingEdited = this.index === 1 ? kycFlowState.documentsBeingEdited.document_1 : kycFlowState.documentsBeingEdited.document_2;
      this.alreadySavedDocument = this.index === 1 ? kycFlowState.documentKycDetail.data.document_1 : kycFlowState.documentKycDetail.data.document_2;
      this.documentManualSubmit = this.index === 1 ? kycFlowState.documentsManualSubmit.document_1 : kycFlowState.documentsManualSubmit.document_2;
      if (this.alreadySavedDocument != null) {
        this.documentType = this.alreadySavedDocument.document_type;
        this.numberOfImagesToUpload = 1;
        this.files = [{
          imageUrl: this.alreadySavedDocument.image_url,
          file: null
        }]
      }
    })
  }
  convertDocumentTypeToOption(documentType: string): Option {
    let option = { display: DROPDOWN_PLACEHOLDER, value: '' };
    this.kycFlowState.documentsRequired.forEach((docArray: Option[]) => {
      docArray.forEach((opt: any) => {
        if (opt.value === documentType) {
          option = opt;
        }
      })
    });
    return option;
  }
  isDocumentAlreadySaved() {
    return this.alreadySavedDocument != null;
  }
  isDropdownDisabled(): boolean {
    return !this.isBeingEdited && this.isDocumentAlreadySaved() || this.disabled;
  }
  showEditButton(): boolean {
    return this.isDocumentAlreadySaved() && !this.isBeingEdited;
  }
  editDocument(): void {
    this.index === 1 ? this.store.dispatch(EditDocument1Action()) : this.store.dispatch(EditDocument2Action());
    if (!this.documentManualSubmit) {
      this.resetAllInputFiles();
      this.resetDropdown();
    }
  }
  noFileSelected(): boolean {
    for (let i = 0; i < this.numberOfImagesToUpload; i++) {
      if (this.files[i].imageUrl === '') {
        return true;
      }
    }
    return false;
  }
  isSubmitButtonDisabled(): boolean {
    return this.showEditButton() || this.disabled || this.noFileSelected() || this.documentType === '';
  }
  rearNeeded(docValue: string): boolean {
    return DOCS_FOR_WHICH_ONLY_FRONT_IS_NEEDED.indexOf(docValue) === -1;
  }
  documentTypeSelectionHandler(event: any) {
    if (this.documentType != event.value) {
      this.resetAllInputFiles();
    }
    this.documentType = event.value;
    this.numberOfImagesToUpload = this.rearNeeded(this.documentType) ? 2 : 1;
    this.submitButtonChangeDetector();
  }
  counter(ind: number) {
    return new Array(ind);
  }
  isUploadedFileImageFile(event: any) {
    return event.target.files[0].type !== -1;
  }
  resetAllInputFiles() {
    this.files = [EMPTY_FILE, EMPTY_FILE];
  }
  resetDropdown() {
    this.documentType = '';
  }
  resetInputFile(event: any) {
    (<HTMLInputElement>document.getElementById(event.target.id)).value = '';
  }
  submitButtonChangeDetector() {
    this.submitButtonDisabled = this.isSubmitButtonDisabled();
  }
  getIndexFromId(id: string): number {
    return parseInt(id.charAt(id.length - 1));
  }
  onFileChanged(event: any) {
    if (this.isUploadedFileImageFile(event)) {
      const i = this.getIndexFromId(event.target.id);
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        this.files[i] = {
          imageUrl: reader.result,
          file: file,
        };
      };
      this.submitButtonChangeDetector();
    } else {
      this.files[this.getIndexFromId(event.target.id)] = EMPTY_FILE;
    }
    this.resetInputFile(event);
  }
  imageInputDisabled() {
    return this.disabled || this.documentType === '';
  }
  submitDocument() {
    const saveObj = new FormData();
    if (this.documentManualSubmit) {
      saveObj.append('image', this.files[0].imageUrl as string);
      saveObj.append('document_value', this.documentNumber);
      saveObj.append('document_name', this.documentName);
    }
    saveObj.append('document_type', this.documentType);
    saveObj.append('document_number', this.index.toString());
    saveObj.append('is_edit_1', this.kycFlowState.documentsBeingEdited.document_1 ? '1' : '0');
    saveObj.append('is_edit_2', this.kycFlowState.documentsBeingEdited.document_2 ? '1' : '0');
    saveObj.append('is_document_2_uploaded', (this.kycFlowState.documentKycDetail.data.document_2!== null && this.kycFlowState.documentKycDetail.data.document_2?.image_url !== '').toString());
    for (let i = 0; i < this.numberOfImagesToUpload; i++) {
      saveObj.append('file_' + (i + 1), this.files[i].file);
    }
    this.documentSubmitEvent.emit(saveObj);
  }
  getDocumentNumber() {
    return this.alreadySavedDocument?.number !== '' ? this.alreadySavedDocument?.number : 'NA'
  }
  getDocumentName() {
    return this.alreadySavedDocument?.name !== '' ? this.alreadySavedDocument?.name : 'NA'
  }
  showDocumentInput() {
    return this.documentManualSubmit && this.isBeingEdited;
  }
  showDocumentDetails() {
    return this.isDocumentAlreadySaved() && !this.isBeingEdited;
  }
}
