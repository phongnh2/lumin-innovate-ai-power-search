import { DocumentEventCollection } from '../DocumentEventCollection';
import { AWS_EVENTS } from 'constants/awsEvents';

jest.mock('../EventCollection', () => {
  return {
    EventCollection: class {
      record = jest.fn();
    },
  };
});

describe('DocumentEventCollection', () => {
  let docEvent: DocumentEventCollection;

  beforeEach(() => {
    docEvent = new DocumentEventCollection();
  });

  it('should record deleteDocument event', () => {
    const payload = { LuminUserId: 'U1', LuminFileId: 'F1' };

    docEvent.deleteDocument(payload);

    expect(docEvent.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.DELETE_DOCUMENT,
      attributes: {
        LuminUserId: 'U1',
        LuminFileId: 'F1',
      },
    });
  });

  it('should record downloadDocumentSuccess event', () => {
    const payload = {
      fileType: 'pdf',
      savedLocation: 'local',
      flattenPdf: true,
    };

    docEvent.downloadDocumentSuccess(payload);

    expect(docEvent.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.DOWNLOAD_DOCUMENT_SUCCESS,
      attributes: {
        fileType: 'pdf',
        savedLocation: 'local',
        flattenPDF: true,
      },
    });
  });

  it('should record documentSaving event', () => {
    const payload = { timeToSaveTheDocument: 200, source: 'auto' };

    docEvent.documentSaving(payload);

    expect(docEvent.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.SAVE_DOCUMENT,
      attributes: {
        timeToSaveTheDocument: 200,
        source: 'auto',
      },
    });
  });
});
