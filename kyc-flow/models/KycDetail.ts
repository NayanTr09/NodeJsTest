export interface DocumentKycDetail {
  success: boolean;
  data: {
    document_1: KycDocument | null;
    document_2: KycDocument | null;
  };
}
export interface KycDocument {
  document_type: string;
  document_value: string;
  image_url: string;
  name: string;
  number: string;
  is_verified: boolean;
  manual_info_saved: boolean;
}
