import { UploadLocation } from 'Integration/constants';

export type DocumentBasicInfoResponseProto = {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  location: {
    type: UploadLocation;
    workspace_id: string;
    space_id?: string;
    folder_id?: string;
  };
  preview_url: string;
  created_at: number;
  updated_at: number;
};
