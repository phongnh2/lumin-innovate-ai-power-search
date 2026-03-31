import { AWS_EVENTS } from 'constants/awsEvents';
import { TEMPLATE_TABS } from 'constants/templateConstant';

jest.mock('../EventCollection', () => ({
  EventCollection: class {
    record = jest.fn();
  },
}));

import { TemplateEventCollection } from '../TemplateEventCollection';

describe('TemplateEventCollection', () => {
  let collection;

  beforeEach(() => {
    collection = new TemplateEventCollection();
  });

  describe('uploadSuccess', () => {
    test('should record upload success with correct attributes', () => {
      const params = {
        fileId: 'file-123',
        fileName: 'test.pdf',
        containFillableFields: true,
        destination: 'personal',
      };

      collection.uploadSuccess(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.TEMPLATE.UPLOAD_SUCCESS,
        attributes: {
          LuminFileId: params.fileId,
          fileName: params.fileName,
          containFillableFields: true,
          containDescription: true,
          destination: 'personal',
        },
      });
    });

    test('should convert ORGANIZATION destination to circle', () => {
      collection.uploadSuccess({
        fileId: 'file-123',
        fileName: 'test.pdf',
        destination: TEMPLATE_TABS.ORGANIZATION,
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            destination: 'circle',
          }),
        })
      );
    });

    test('should default containFillableFields to false', () => {
      collection.uploadSuccess({
        fileId: 'file-123',
        fileName: 'test.pdf',
        destination: 'personal',
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            containFillableFields: false,
          }),
        })
      );
    });
  });

  describe('createdSuccess', () => {
    test('should record created success with correct attributes', () => {
      const params = {
        fileId: 'file-123',
        fileName: 'test.pdf',
        containFillableFields: true,
        destination: 'personal',
      };

      collection.createdSuccess(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.TEMPLATE.CREATED_SUCCESS,
        attributes: {
          LuminFileId: params.fileId,
          fileName: params.fileName,
          containFillableFields: true,
          containDescription: true,
          destination: 'personal',
        },
      });
    });

    test('should convert ORGANIZATION destination to circle', () => {
      collection.createdSuccess({
        fileId: 'file-123',
        fileName: 'test.pdf',
        destination: TEMPLATE_TABS.ORGANIZATION,
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            destination: 'circle',
          }),
        })
      );
    });

    test('should default containFillableFields to false', () => {
      collection.createdSuccess({
        fileId: 'file-123',
        fileName: 'test.pdf',
        destination: 'personal',
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            containFillableFields: false,
          }),
        })
      );
    });
  });

  describe('useTemplateSuccess', () => {
    test('should record use template success', () => {
      collection.useTemplateSuccess({
        fileId: 'file-123',
        location: 'personal',
      });

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.TEMPLATE.USE_TEMPLATE_SUCCESS,
        attributes: {
          LuminFileId: 'file-123',
          fileLocation: 'personal',
        },
      });
    });

    test('should convert ORGANIZATION location to circle', () => {
      collection.useTemplateSuccess({
        fileId: 'file-123',
        location: TEMPLATE_TABS.ORGANIZATION,
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            fileLocation: 'circle',
          }),
        })
      );
    });
  });

  describe('deleteTemplateSuccess', () => {
    test('should record delete template success', () => {
      collection.deleteTemplateSuccess({
        fileId: 'file-123',
        location: 'personal',
      });

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.TEMPLATE.DELETE_TEMPLATE_SUCCESS,
        attributes: {
          LuminFileId: 'file-123',
          fileLocation: 'personal',
        },
      });
    });

    test('should convert ORGANIZATION location to circle', () => {
      collection.deleteTemplateSuccess({
        fileId: 'file-123',
        location: TEMPLATE_TABS.ORGANIZATION,
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            fileLocation: 'circle',
          }),
        })
      );
    });
  });

  describe('editTemplateSuccess', () => {
    test('should record edit template success', () => {
      collection.editTemplateSuccess({
        fileId: 'file-123',
        location: 'personal',
      });

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.TEMPLATE.EDIT_TEMPLATE_SUCCESS,
        attributes: {
          LuminFileId: 'file-123',
          fileLocation: 'personal',
        },
      });
    });

    test('should convert ORGANIZATION location to circle', () => {
      collection.editTemplateSuccess({
        fileId: 'file-123',
        location: TEMPLATE_TABS.ORGANIZATION,
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            fileLocation: 'circle',
          }),
        })
      );
    });
  });

  describe('previewTemplate', () => {
    test('should record preview template', () => {
      collection.previewTemplate({
        fileId: 'file-123',
        location: 'personal',
      });

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.TEMPLATE.PREVIEW_TEMPLATE,
        attributes: {
          LuminFileId: 'file-123',
          fileLocation: 'personal',
        },
      });
    });

    test('should convert ORGANIZATION location to circle', () => {
      collection.previewTemplate({
        fileId: 'file-123',
        location: TEMPLATE_TABS.ORGANIZATION,
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            fileLocation: 'circle',
          }),
        })
      );
    });
  });

  describe('previewScrollToBottom', () => {
    test('should record preview scroll to bottom', () => {
      collection.previewScrollToBottom({
        fileId: 'file-123',
        location: 'personal',
      });

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.TEMPLATE.PREVIEW_TEMPLATE_SCROLL,
        attributes: {
          LuminFileId: 'file-123',
          fileLocation: 'personal',
        },
      });
    });

    test('should convert ORGANIZATION location to circle', () => {
      collection.previewScrollToBottom({
        fileId: 'file-123',
        location: TEMPLATE_TABS.ORGANIZATION,
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            fileLocation: 'circle',
          }),
        })
      );
    });
  });
});
