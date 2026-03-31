import React from 'react';

import { DropboxFileChooserProps } from './DropboxFileChooser';

type DropboxFileChooserWrapperProps = Omit<
  DropboxFileChooserProps,
  'currentOrganization' | 'updateDocumentData' | 'currentFolderType' | 't'
>;

declare const DropboxFileChooserWrapper: React.ComponentType<DropboxFileChooserWrapperProps>;

export default DropboxFileChooserWrapper;
