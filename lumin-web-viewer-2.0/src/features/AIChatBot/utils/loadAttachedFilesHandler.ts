import { AttachedFileType } from 'features/AIChatBot/interface';
import { LoadDocumentHandler } from 'features/MultipleMerge/core/loadDocument';

export class ChatbotLoadAttachedFilesHandler extends LoadDocumentHandler {
  setAttachedFiles(attachedFiles: AttachedFileType[]) {
    const documents = attachedFiles.map(({ id, file, source, remoteId }) => ({
      _id: id,
      file,
      source,
      name: file.name,
      remoteId,
    }));

    return this.setItems(documents);
  }

  async handle() {
    try {
      return await super.handle();
    } catch (error) {
      throw new Error('Failed to load chatbot attached document', { cause: error as Error });
    }
  }
}
