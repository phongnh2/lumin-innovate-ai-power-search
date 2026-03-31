import { AWS_EVENTS } from 'constants/awsEvents';

import { EventCollection } from './EventCollection';

export const MessageName = {
  DOWNLOAD_DOCUMENT: 'Download',
  PRINT_DOCUMENT: 'Print',
  SHARE_DOCUMENT: 'share',
  COPY_DOCUMENT_LINK: 'copyDocumentLink',
  COMMENT_HISTORY: 'CommentHistory',
  SEARCH_IN_DOCUMENT: 'SearchBox',
};

export const MessagePurpose = {
  [MessageName.DOWNLOAD_DOCUMENT]: 'Download from right sidebar',
  [MessageName.PRINT_DOCUMENT]: 'Start to print',
  [MessageName.SHARE_DOCUMENT]: 'Start to share',
  [MessageName.COPY_DOCUMENT_LINK]: 'Copy document link',
  [MessageName.COMMENT_HISTORY]: 'Open comment history panel',
  [MessageName.SEARCH_IN_DOCUMENT]: 'Open search panel',
};

export class RightBarEventCollection extends EventCollection {
  clicked(messageName) {
    const attributes = {
      elementName: messageName,
      elementPurpose: MessagePurpose[messageName],
    };
    return this.record({
      name: AWS_EVENTS.RIGHT_SIDE_BAR,
      attributes,
    });
  }
}

export default new RightBarEventCollection();
