import Axios from '@libs/axios';

import { IAgreement } from '../interfaces/agreement';

export const createAgreementFromPdf = async ({ data, workspaceUrl }: {
  data: FormData
  workspaceUrl: string
}): Promise<{
  agreement: IAgreement;
  flow: string;
}> => {
  const endpoint = workspaceUrl ? `/workspace/${workspaceUrl}/agreement/create-from-pdf` : '/agreement/create-from-pdf';

  const response = await Axios.axiosAgreementGenInstance.post<{
    agreement: IAgreement;
    flow: string;
  }>(endpoint, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
