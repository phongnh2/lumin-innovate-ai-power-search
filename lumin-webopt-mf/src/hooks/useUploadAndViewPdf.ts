import { pdfApiClient } from "@/libs/axios";
import {
  getPresignedUrlForFileUploaded,
  uploadFileToS3,
} from "@/services/documentService";
import { getAllowedFileName } from "@/utils/files";
import { getCreateExternalPdfUrl } from "@/utils/upload";

interface UploadAndViewOptions {
  fileUrl: string;
  title: string;
  action?: string;
}

export const useUploadAndViewPdf = () => {
  const uploadAndView = async ({
    fileUrl,
    title,
    action = "edit",
  }: UploadAndViewOptions) => {
    console.log("🚀 ~ uploadAndView ~ fileUrl:", fileUrl);
    try {
      const fileName = getAllowedFileName(`${title}.pdf`);

      const pdfResponse = await pdfApiClient.post(
        "/api/v1/pdf/fetch",
        {
          url: fileUrl,
          filename: fileName,
        },
        {
          responseType: "blob",
        },
      );

      const file = new File([pdfResponse.data], fileName, {
        type: "application/pdf",
      });
      console.log("🚀 ~ uploadAndView ~ HAS FILE:", Boolean(file));

      const {
        data: { document: presignedData, encodedUploadData },
      } = await getPresignedUrlForFileUploaded({
        documentMimeType: file.type,
        documentName: fileName,
      });

      if (!presignedData) {
        throw new Error("Cannot get presigned URL for this file");
      }

      await uploadFileToS3({
        presignedUrl: presignedData.url,
        file,
      });

      const createExternalPdfUrl = getCreateExternalPdfUrl({
        action,
        encodedUploadData,
      });

      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "NAVIGATE_TO_VIEWER",
            payload: { url: createExternalPdfUrl },
          },
          "*",
        );
      } else {
        window.location.href = createExternalPdfUrl;
      }

      return { success: true, documentId: presignedData.fields.key, fileName };
    } catch (error) {
      console.error("Error uploading and viewing PDF:", error);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: false, error: "Fallback download executed" };
    }
  };

  return { uploadAndView };
};
