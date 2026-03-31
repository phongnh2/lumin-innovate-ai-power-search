import React from 'react';

import { GoogleFilePickerProps } from './GoogleFilePicker';

type GoogleFilePickerWrapperProps = Omit<
  GoogleFilePickerProps,
  'currentOrganization' | 'updateDocumentData' | 'currentFolderType' | 't' | 'handlePickThirdPartyFile'
>;

declare const GoogleFilePickerWrapper: React.ComponentType<GoogleFilePickerWrapperProps>;

export default GoogleFilePickerWrapper;
