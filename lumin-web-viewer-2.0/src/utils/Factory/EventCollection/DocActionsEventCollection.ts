import { MAX_PINPOINT_VALUE_CHARACTER } from 'utils/getCommonAttributes';

import { AWS_EVENTS } from 'constants/awsEvents';

import { ActionName, ObjectType, QuickAction, DocumentDropdownAction } from './constants/DocumentActionsEvent';
import { EventCollection } from './EventCollection';

type NumberSelectedAttributes = {
  numberSelectedDocs: number;
  numberSelectedFolders: number;
};

type DocActionsEvent = NumberSelectedAttributes & {
  actionName: ActionName;
};

type BulkDownloadSuccessEvent = NumberSelectedAttributes & {
  downloadId: string;
};

type BulkDownloadErrorEvent = {
  downloadId?: string;
  numberSelectedDocs: number;
  error: string;
};

type QuickActionsEvent = {
  object: ObjectType;
  action: QuickAction;
};

type DocumentDropdownEvent = {
  action: DocumentDropdownAction;
};

type ClickEvent = {
  elementName: string;
};

export class DocActionsEventCollection extends EventCollection {
  bulkActions(attributes: DocActionsEvent) {
    return this.record({
      name: AWS_EVENTS.DOCUMENT_ACTION.BULK_ACTIONS,
      attributes,
    });
  }

  bulkDownloadSuccess(attributes: BulkDownloadSuccessEvent) {
    return this.record({
      name: AWS_EVENTS.DOCUMENT_ACTION.BULK_DOWNLOAD_SUCCESS,
      attributes,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private splitErrorIntoChunks(error: string, maxLength: number): string[] {
    if (error.length <= maxLength) {
      return [error];
    }

    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < error.length) {
      const chunk = error.slice(currentIndex, currentIndex + maxLength);
      const lastCommaIndex = chunk.lastIndexOf(',');

      const splitIndex = lastCommaIndex > 0 ? lastCommaIndex : maxLength;
      chunks.push(error.slice(currentIndex, currentIndex + splitIndex));

      currentIndex += splitIndex + (lastCommaIndex > 0 ? 2 : 0);
    }

    return chunks;
  }

  bulkDownloadError({ downloadId, numberSelectedDocs, error }: BulkDownloadErrorEvent) {
    const errors = {} as Record<string, string>;
    const chunks = this.splitErrorIntoChunks(error, MAX_PINPOINT_VALUE_CHARACTER);

    chunks.forEach((chunk, index) => {
      const key = index === 0 ? 'error' : `error_${index}`;
      errors[key] = chunk;
    });
    return this.record({
      name: AWS_EVENTS.DOCUMENT_ACTION.BULK_DOWNLOAD_ERROR,
      attributes: { downloadId, numberSelectedDocs, ...errors },
    });
  }

  quickActions(attributes: QuickActionsEvent) {
    return this.record({
      name: AWS_EVENTS.DOCUMENT_ACTION.QUICK_ACTIONS,
      attributes,
    });
  }

  documentDropdown(attributes: DocumentDropdownEvent) {
    return this.record({
      name: AWS_EVENTS.DOCUMENT_ACTION.DOCUMENT_DROPDOWN,
      attributes,
    });
  }

  click(attributes: ClickEvent) {
    return this.record({
      name: AWS_EVENTS.CLICK,
      attributes,
    });
  }
}

export default new DocActionsEventCollection();
