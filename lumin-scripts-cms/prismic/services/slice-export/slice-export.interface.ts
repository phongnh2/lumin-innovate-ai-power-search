export interface ISliceExportRow {
  slice_name: string;
  variation: string;
  legacy_or_current: string;
  type_it_belongs_to: string;
  list_of_pages_using_the_slice: string;
  page_link: string;
}

export interface ISliceData {
  slice_type: string;
  variation: string;
  prismic_uid: string;
  prismic_id: string;
  content_type: string;
}

export interface IPrismicDocument {
  id: string;
  uid: string;
  type: string;
  data: {
    body?: ISlice[];
  };
}

export interface ISlice {
  slice_type: string;
  variation: string;
  id: string;
  slice_label?: string | null;
}

export interface ISliceExportService {
  exportSlicesToCSV(): Promise<void>;
  processDocumentsFromFolder(folderPath: string): Promise<ISliceData[]>;
  extractSlicesFromDocument(document: IPrismicDocument, contentType: string): ISliceData[];
}