export interface IsSelfieEnableResponse {
    selfie_enable: boolean;
    manual_image: boolean;
    is_manual: boolean;
    aadhaar_enable: boolean;
    gst_enable: boolean;
    step_1_verification: {
        kyc_1: ImageKyc,
        kyc_2: ImageKyc
    },
    kyc_saved_details: {
        1: KycDetail;
        2: KycDetail;
    }
}

export interface ImageKyc {
    verified: boolean;
    image: string;
    image_type: string;
    company_type: string;
    is_valid: number | boolean;
}

export interface Document {
    document_type: string;
    image_url: string;
    name: string;
    number: string;
}
export interface KycDetail {
    company_type: string;
    kyc_type: string;
    status: number;
    selfie_image: string;
    rejection_reason: string;
    remarks: string;
    modified_by: string;
    verified_at: string;
    final_save: false;
    document_1: Document;
    document_2: Document;
}