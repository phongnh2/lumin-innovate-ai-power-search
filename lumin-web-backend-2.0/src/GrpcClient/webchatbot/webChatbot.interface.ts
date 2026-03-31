import { Observable } from 'rxjs';

import { DocumentTab } from 'graphql.schema';

export interface ChatMessage {
  content: string;
}

export interface ChatContext {
  orgId: string;
  teamIds: string[];
  currentTeamId?: string;
  folderId?: string;
  documentTab?: DocumentTab;
}

export interface ChatMetadata {
  luminLanguage: string;
  browserLanguage: string;
  orgId: string;
  orgPaymentType: string;
  userEmailDomain: string;
}

export interface ChatRequest {
  userId: string;
  context: ChatContext;
  message: ChatMessage;
  threadId?: string;
  metadata: ChatMetadata;
}

export interface ChatResponse {
  data: Uint8Array;
}

export interface WebChatbotService {
  StreamChat(request: ChatRequest): Observable<ChatResponse>;
}
