export interface CheckLivelinessResponse {
  success: boolean;
  status: number;
  is_manual: boolean;
  selfie_enable: boolean;
  manual_image: boolean;
  aadhaar_enable: boolean;
  gst_enable: boolean;
  image: string;
  message: string;
}
