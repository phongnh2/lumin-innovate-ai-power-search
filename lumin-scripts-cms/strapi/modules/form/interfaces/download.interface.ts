import { ICsvRawData } from "./csv-data.interface.ts";

export interface IResultDownloadPDF {
  success: boolean;
  formData: ICsvRawData;
}

export enum ResultStatus {
  FULFILLED = "fulfilled",
  REJECTED = "rejected",
}
