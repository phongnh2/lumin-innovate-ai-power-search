import Axios from '@libs/axios';

import { AgreementApi } from 'features/AgreementGen/constants';
import { IAgreement } from 'features/AgreementGen/interfaces/agreement';

export const createAgreementFromLlmPrompt = async (data: {
  prompt: string;
  event: string;
  workspaceUrl: string;
}): Promise<IAgreement> => {
  const { workspaceUrl, ...params } = data;

  const api = AgreementApi.CreateFromLlmPrompt.replace('{workspaceUrl}', workspaceUrl);

  const response = await Axios.axiosAgreementGenInstance.post<IAgreement>(api, params);

  return response.data;
};
