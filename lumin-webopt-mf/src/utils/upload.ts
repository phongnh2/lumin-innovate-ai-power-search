interface GetCreateExternalPdfUrlParams {
  action: string;
  encodedUploadData: string;
  lastAccessOrganizationId?: string;
}

export const getCreateExternalPdfUrl = ({
  action,
  encodedUploadData,
  lastAccessOrganizationId,
}: GetCreateExternalPdfUrlParams): string => {
  const baseUrl = process.env.LUMIN_PDF_APP_URL || "http://localhost:3000";
  const createExternalPdfParams = new URLSearchParams();

  createExternalPdfParams.append("action", action);
  createExternalPdfParams.append("from", "functional-landing-page");
  createExternalPdfParams.append("encodeData", encodedUploadData);

  if (lastAccessOrganizationId) {
    createExternalPdfParams.append("orgId", lastAccessOrganizationId);
  }

  return `${baseUrl}/create-external-pdf?${createExternalPdfParams.toString()}`;
};
