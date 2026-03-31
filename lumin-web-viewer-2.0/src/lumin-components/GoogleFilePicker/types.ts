export type DocumentObjects = {
  id: string;
  mimeType?: string;
  name?: string;
  sizeBytes?: number;
};

export type ResponseObject = {
  docs: DocumentObjects[];
};
