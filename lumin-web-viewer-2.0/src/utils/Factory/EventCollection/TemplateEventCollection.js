import { AWS_EVENTS } from 'constants/awsEvents';
import { TEMPLATE_TABS } from 'constants/templateConstant';

import { EventCollection } from './EventCollection';

const convertDestinationText = (destination) => (destination === TEMPLATE_TABS.ORGANIZATION ? 'circle' : destination);

export class TemplateEventCollection extends EventCollection {
  uploadSuccess({
    fileId,
    fileName,
    containFillableFields = false,
    destination,
  }) {
    return this.record({
      name: AWS_EVENTS.TEMPLATE.UPLOAD_SUCCESS,
      attributes: {
        LuminFileId: fileId,
        fileName,
        containFillableFields,
        containDescription: true,
        destination: convertDestinationText(destination),
      },
    });
  }

  createdSuccess({
    fileId,
    fileName,
    containFillableFields = false,
    destination,
  }) {
    return this.record({
      name: AWS_EVENTS.TEMPLATE.CREATED_SUCCESS,
      attributes: {
        LuminFileId: fileId,
        fileName,
        containFillableFields,
        containDescription: true,
        destination: convertDestinationText(destination),
      },
    });
  }

  useTemplateSuccess({
    fileId,
    location,
  }) {
    return this.record({
      name: AWS_EVENTS.TEMPLATE.USE_TEMPLATE_SUCCESS,
      attributes: {
        LuminFileId: fileId,
        fileLocation: convertDestinationText(location),
      },
    });
  }

  deleteTemplateSuccess({
    fileId,
    location,
  }) {
    return this.record({
      name: AWS_EVENTS.TEMPLATE.DELETE_TEMPLATE_SUCCESS,
      attributes: {
        LuminFileId: fileId,
        fileLocation: convertDestinationText(location),
      },
    });
  }

  editTemplateSuccess({
    fileId,
    location,
  }) {
    return this.record({
      name: AWS_EVENTS.TEMPLATE.EDIT_TEMPLATE_SUCCESS,
      attributes: {
        LuminFileId: fileId,
        fileLocation: convertDestinationText(location),
      },
    });
  }

  previewTemplate({
    fileId,
    location,
  }) {
    return this.record({
      name: AWS_EVENTS.TEMPLATE.PREVIEW_TEMPLATE,
      attributes: {
        LuminFileId: fileId,
        fileLocation: convertDestinationText(location),
      },
    });
  }

  previewScrollToBottom({
    fileId,
    location,
  }) {
    return this.record({
      name: AWS_EVENTS.TEMPLATE.PREVIEW_TEMPLATE_SCROLL,
      attributes: {
        LuminFileId: fileId,
        fileLocation: convertDestinationText(location),
      },
    });
  }
}

export default new TemplateEventCollection();
