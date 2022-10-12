export interface DocListResponse {
  success: boolean;
  data: DocData[];
}

export interface DocData {
  name: string;
  value: string;
}
