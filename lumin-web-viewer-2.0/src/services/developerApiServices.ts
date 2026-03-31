import Axios from '@libs/axios';

import { DEVELOPER_API_BASEURL } from 'constants/urls';

export interface IApiKey {
  id: string;
  value: string;
  name: string;
  createdAt: Date;
  lastUsedAt: Date;
  isPrimaryKey: boolean;
}

interface IApiKeyResponse {
  id: string;
  value: string;
  name: string;
  created_at: Date;
  last_used_at: Date;
  is_primary_key: boolean;
}

const API_KEY_BASE_URL = `${DEVELOPER_API_BASEURL}/api_key`;
const ACCOUNT_CALLBACK_BASE_URL = `${DEVELOPER_API_BASEURL}/user/account_callback`;

const transformApiKey = (item: IApiKeyResponse): IApiKey => ({
  id: item.id,
  value: item.value,
  name: item.name,
  createdAt: item.created_at,
  lastUsedAt: item.last_used_at,
  isPrimaryKey: item.is_primary_key,
});

export const developerApiServices = {
  async getApiKeys(workspaceId: string): Promise<IApiKey[]> {
    const { data } = await Axios.axiosDeveloperApiInstance.get<IApiKeyResponse[]>(
      `${API_KEY_BASE_URL}/list?workspace_id=${workspaceId}`
    );
    return data.map(transformApiKey);
  },

  async createApiKey(params: { name: string; workspaceId: string }): Promise<IApiKey> {
    const { data } = await Axios.axiosDeveloperApiInstance.post<IApiKeyResponse>(`${API_KEY_BASE_URL}/create`, {
      key_name: params.name,
      workspace_id: params.workspaceId,
    });
    return transformApiKey(data);
  },

  async renameApiKey(params: { keyId: string; newName: string; workspaceId: string }): Promise<IApiKey> {
    const { data } = await Axios.axiosDeveloperApiInstance.patch<IApiKeyResponse>(`${API_KEY_BASE_URL}/rename`, {
      key_id: params.keyId,
      new_name: params.newName,
      workspace_id: params.workspaceId,
    });
    return transformApiKey(data);
  },

  async makeKeyAsPrimary(keyId: string, workspaceId: string): Promise<IApiKey> {
    const { data } = await Axios.axiosDeveloperApiInstance.patch<IApiKeyResponse>(`${API_KEY_BASE_URL}/make_primary`, {
      key_id: keyId,
      workspace_id: workspaceId,
    });
    return transformApiKey(data);
  },

  async deleteApiKey(keyId: string, workspaceId: string): Promise<void> {
    await Axios.axiosDeveloperApiInstance.delete<IApiKeyResponse>(`${API_KEY_BASE_URL}/delete`, {
      data: {
        key_id: keyId,
        workspace_id: workspaceId,
      },
    });
  },

  async getCallbackUrl(workspaceId: string): Promise<string> {
    const { data } = await Axios.axiosDeveloperApiInstance.get<{ callback_url: string }>(
      `${ACCOUNT_CALLBACK_BASE_URL}/get?workspace_id=${workspaceId}`
    );
    return data.callback_url;
  },

  async changeAccountCallback(params: { callbackUrl: string; workspaceId: string }): Promise<void> {
    await Axios.axiosDeveloperApiInstance.put(`${ACCOUNT_CALLBACK_BASE_URL}/change`, {
      callback_url: params.callbackUrl,
      workspace_id: params.workspaceId,
    });
  },
};
