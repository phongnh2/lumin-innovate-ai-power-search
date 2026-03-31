export type DocumentObjects = {
  id: string;
  name?: string;
  isShared?: boolean;
};

export type ResponseObject = {
  docs: DocumentObjects[];
};

export type FolderPickerRefType = { openPicker: () => void };
