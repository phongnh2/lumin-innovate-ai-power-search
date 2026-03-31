import React from 'react';

import { FolderPickerRefType, ResponseObject } from './type';

type GoogleFolderPickerProps = {
  multiSelect?: boolean;
  children?: React.ReactNode;
  selectedFolder?: (data: ResponseObject) => void;
  onClose?: () => void;
  loadingModal?: () => void;
};

declare const GoogleFolderPicker: React.ForwardRefExoticComponent<
  GoogleFolderPickerProps & React.RefAttributes<FolderPickerRefType>
>;

export default GoogleFolderPicker;
