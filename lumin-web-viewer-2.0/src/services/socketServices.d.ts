import { Socket } from '../socket';

declare class SocketService {
  socket: Socket;

  constructor();

  /**
   * Adds a user to a room
   * @param userId The ID of the user to add
   */
  addUserToRoom(userId: string | number): this;

  /**
   * Handles a user leaving a team
   * @param options The options containing teamId and userId
   */
  userLeaveTeam(options: { teamId: string | number; userId: string | number }): this;

  /**
   * Changes a user's role in a team
   * @param options The options containing teamId, userId and role
   */
  changeTeamRole(options: { teamId: string | number; userId: string | number; role: string }): this;

  /**
   * Sends auto sync result
   * @param options The sync result options
   */
  sendAutoSyncResult(options: {
    remoteId: string | number;
    documentId: string | number;
    status: string | boolean;
    message?: string;
    reason?: string;
    dataSync?: unknown;
    hasAppliedRedaction?: boolean;
    increaseVersion?: boolean;
  }): this;

  /**
   * Toggles auto sync for a document
   * @param documentId The ID of the document
   * @param enableGoogleSync Whether to enable Google sync
   */
  toggleAutoSync(documentId: string, enableGoogleSync: boolean): this;

  /**
   * Starts merging a document
   * @param params.userId The ID of the user
   * @param params.documentId The ID of the document
   */
  startMergingDocument(params: { userId: string; documentId: string }): this;

  /**
   * Finishes merging a document
   * @param params.userId The ID of the user
   * @param params.documentId The ID of the document
   * @param params.totalPages The total number of pages in the document
   */
  finishMergingDocument(params: { userId: string; documentId: string; totalPages: number }): this;

  /**
   * Modifies the content of a document
   * @param documentId The ID of the document
   * @param options.status The status of document content syncing
   * @param options.increaseVersion Whether to increase the version of the document
   * @param options.isAppliedOCR Whether the OCR has been applied to the document
   */
  modifyDocumentContent(
    documentId: string,
    {
      status,
      increaseVersion,
      isAppliedOCR,
    }: { status: 'preparing' | 'syncing' | 'failed'; increaseVersion: boolean; isAppliedOCR?: boolean }
  ): this;

  annotationChange(
    data: {
      roomId: string;
      xfdf: string;
      annotationId: string;
      userId: string;
      email: string;
      annotationType: string;
      annotationAction: string;
      pageIndex?: number;
      imageRemoteId?: string;
      isInternal?: boolean;
      comment?: {
        content: string;
      };
      shouldCreateEvent?: boolean;
      reorderType?: 'front' | 'back';
    },
    { timeout }?: { timeout?: number }
  ): Promise<{
    data: {
      annotationId: string;
      action: string;
      pageIndex: number;
    };
  }>;

  updateDocumentSize(documentId: string, size: number): this;
}

export const socketService: SocketService;

export default SocketService;
