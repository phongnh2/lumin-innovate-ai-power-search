type TempAction = {
  type: 'annotation' | 'field' | 'manipulation';
  data?: { name: string; value?: string };
  xfdf?: string;
};

export default class CommandHandler {
  insertField(documentId: string, data: { name: string; value?: string }): void;
  insertTempAction(documentId: string, data: Array<TempAction>): void;
  findCommandAndOverride(data: {
    documentId: string;
    annotationId: string;
    overrideObj: Record<string, unknown>;
  }): Promise<void>;
  getAllTempAction(documentId: string): Promise<Array<{ type: string; data: Record<string, unknown> }>>;

  enabledOfflineTracking: boolean;
}
