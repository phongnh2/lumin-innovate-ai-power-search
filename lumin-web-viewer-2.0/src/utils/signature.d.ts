import { IUser } from "interfaces/user/user.interface";

declare namespace signatureUtils {
  export function fetchUserSignatureSignedUrlsInRange(params: { offset: number }): Promise<{
    signatures: {
      remoteId: string;
      presignedUrl: string;
    }[];
    total: number;
    hasNext: boolean;
  }>;

  export function getBase64FromUrl(params: { imageData: string; remoteId: string; }): Promise<{
    imgSrc: string;
    width: number;
    height: number;
    remoteId: string;
  }>;

  export function getNumberOfSignatures(currentUser: IUser): Promise<number>;
}

export default signatureUtils;
