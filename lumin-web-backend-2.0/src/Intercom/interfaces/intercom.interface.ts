import { IntercomContactRole } from '../intercom.enum';

export interface IIntercomContact {
  id: string;
  email: string;
  name?: string;
  created_at?: number;
  role: IntercomContactRole;
}

export interface IIntercomSearchResponse {
  type: string;
  data: IIntercomContact[];
  total_count: number;
  pages: {
    type: string;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface IIntercomConversation {
  id: string;
  created_at: number;
  updated_at: number;
  body: string;
}

export interface IIntercomEphemeralToken {
  token: string;
  level: number;
}
