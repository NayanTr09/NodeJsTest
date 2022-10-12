import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckLivelinessResponse } from '../../models/CheckLivelinessResponse';
import { initialState, KycFlowState } from '../../services/kyc-flow.reducer';
import { selectKycFlowState } from '../../services/kyc-flow.selectors';
import { KycFlowService } from '../../services/kyc-flow.service';
const EMPTY_MEDIA_STREAM = {} as MediaStream;
@Component({
  selector: 'app-photo-identification-container',
  templateUrl: './photo-identification-container.component.html',
  styleUrls: ['./photo-identification-container.component.scss'],
})
export class PhotoIdentificationContainerComponent
  implements OnInit, AfterViewInit, OnDestroy {
  imageUrl: any = '';
  businessStructure: number = 1;

  WIDTH = 640;
  HEIGHT = 480;

  @ViewChild('video')
  public video!: ElementRef;

  @ViewChild('canvas')
  public canvas!: ElementRef;

  @ViewChild('inputImage')
  public inputImage!: ElementRef;

  captures: string[] = [];
  error: any;
  isCaptured: boolean = false;
  isCapturingStarted: boolean = false;
  videoStream: MediaStream = EMPTY_MEDIA_STREAM;
  fileChosen: String | ArrayBuffer | null = '';
  imageVerified = false;
  isManualFlow = false;
  isValidImage = false;
  kycFlowState: KycFlowState = initialState;
  showAlreadySavedImage = true;
  liveliness = false;
  noCameraPermissionManuallyTakePhoto = false;
  constructor(private router: Router, public kycFlowService: KycFlowService, private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService, private store: Store) {
    this.kycFlowService.callIsSelfieEnable().subscribe();
  }

  ngOnInit(): void {
    this.store.select(selectKycFlowState).subscribe((kycFlowState: KycFlowState) => {
      this.kycFlowState = kycFlowState;
      if(kycFlowState.selectedBusinessStructure === 1 && kycFlowState.companyType === '') {
        this.goBack();
      }
    })
    this.businessStructure = this.kycFlowService.fetchBusinessStructureFromUrl();
  }

  ngOnDestroy(): void {
    this.handleStopCapturing();
  }

  goBack() {
    this.router.navigate([`/kyc-flow/`]);
  }

  async ngAfterViewInit() { }

  async handleStartCapturing() {
    this.isCapturingStarted = true;
    await this.setupDevices();
  }

  handleStopCapturing() {
    if (this.videoStream !== EMPTY_MEDIA_STREAM) {
      this.videoStream.getVideoTracks().forEach(track => track.stop());
    }
  }

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        this.videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (this.videoStream) {
          this.video.nativeElement.srcObject = this.videoStream;
          this.video.nativeElement.play();
          this.error = null;
        } else {
          this.error = 'You have no output video device';
        }
      } catch (e) {
        this.error = e;
        this.kycFlowService.showNotification('warning', 'Error getting camera permissions! Please upload photo manually.');
        this.noCameraPermissionManuallyTakePhoto = true;
      }
    }
  }

  capture() {
    this.drawImageToCanvas(this.video.nativeElement);
    this.imageUrl = this.canvas.nativeElement.toDataURL('image/png', 1.5);
    this.isCaptured = true;
    this.handleStopCapturing();
    this.ngxLoader.start('checking liveliness');
    (<HTMLCanvasElement>document.getElementById('canvas')).toBlob(file => {
      const saveObj = new FormData();
      saveObj.append('image_type', 'webcam');
      saveObj.append('file', file as Blob);
      saveObj.append('kyc_type', this.businessStructure.toString());
      saveObj.append('company_type', this.kycFlowState.companyType);;
      this.checkLiveliness(saveObj);
    })
  }
  
  showVerifiedIcon() {
    return this.showAlreadySavedImage && this.kycFlowState.isValidImage || this.liveliness;
  }
  
  checkLiveliness(saveObj: FormData) {
    this.kycFlowService.checkLiveliness(saveObj).subscribe((resp: CheckLivelinessResponse) => {
      this.liveliness = resp.success && resp.aadhaar_enable && resp.gst_enable;
      this.ngxLoader.stop('checking liveliness');
    }, (error) => {
      if (error?.error?.message) {
        this.toastr.error(error.error.message);
        this.ngxLoader.stop('checking liveliness');
      }
    });
    this.ngxLoader.stop('checking liveliness');
  }

  removeCurrent() {
    this.isCaptured = false;
    this.isCapturingStarted = false;
    this.imageUrl = null;
    this.fileChosen = '';
    this.showAlreadySavedImage = false;
    this.liveliness = false;
    if (this.kycFlowState.isSelfieEnable) {
      this.handleStartCapturing();
    }
  }

  drawImageToCanvas(image: any) {
    const video: HTMLVideoElement = document.getElementById(
      'video'
    ) as HTMLVideoElement;
    const canvas: HTMLCanvasElement = document.getElementById(
      'canvas'
    ) as HTMLCanvasElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    this.canvas.nativeElement
      .getContext('2d')
      .drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  onSubmit() {
    this.ngxLoader.start('photo-submit');
    setTimeout(() => {
      this.ngxLoader.stop('photo-submit');
      this.router.navigateByUrl(
        `/kyc-flow/${this.businessStructure}/verify-documents`
      );
    }, 2000);
  }

  inputFileChanged(event: any) {
    const reader = new FileReader();
    reader.onload = () => this.fileChosen = reader.result;
    reader.readAsDataURL(event.target.files[0]);
    this.isCaptured = true;
    const saveObj = new FormData();
    saveObj.append('image_type', 'manual');
    saveObj.append('file', new Blob(event.target.files, { type: event.target.files[0].type }));
    saveObj.append('kyc_type', this.businessStructure.toString());
    saveObj.append('company_type', this.kycFlowState.companyType);
    this.checkLiveliness(saveObj);
  }

  needToShowAlreadySavedImage() {
    return this.showAlreadySavedImage && this.kycFlowState.step1Verified;
  }
}
