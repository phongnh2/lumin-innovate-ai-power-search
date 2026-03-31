export interface IAgreement {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  conversationId?: string;
  isEmpty: boolean;
  workspaceUrl: string;
}
