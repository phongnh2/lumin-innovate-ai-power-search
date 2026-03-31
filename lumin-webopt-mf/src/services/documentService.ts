import axios from "axios";
import { LUMIN_WEB_API_ROUTES } from "@/constants/apiRoutes";

interface GetPresignedUrlParams {
  documentMimeType: string;
  thumbnailMimeType?: string;
  documentName: string;
}

interface UploadFileToS3Params {
  presignedUrl: string;
  file: File;
  setFileUploadProgress?: (progress: number) => void;
  md5Hash?: string;
}

export const getPresignedUrlForFileUploaded = ({
  documentMimeType,
  thumbnailMimeType,
  documentName,
}: GetPresignedUrlParams) => {
  const backendUrl =
    process.env.LUMIN_PDF_BACKEND_URL || "http://localhost:4200";

  return axios.get(
    `${backendUrl}${LUMIN_WEB_API_ROUTES.GetPresignedUrlForFileUploaded}`,
    {
      params: {
        documentMimeType,
        thumbnailMimeType,
        documentName,
      },
      withCredentials: true,
    },
  );
};

export const uploadFileToS3 = ({
  presignedUrl,
  file,
  setFileUploadProgress,
  md5Hash,
}: UploadFileToS3Params) =>
  axios.put(presignedUrl, file, {
    headers: {
      "Content-Type": file.type,
      ...(md5Hash && { "Content-MD5": md5Hash }),
    },
    onUploadProgress: (progressEvent) => {
      if (setFileUploadProgress && progressEvent.total) {
        const progress = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100,
        );
        setFileUploadProgress(progress);
      }
    },
  });
