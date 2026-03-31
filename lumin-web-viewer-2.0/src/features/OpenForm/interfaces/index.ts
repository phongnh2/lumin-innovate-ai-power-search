export interface FormFile {
  url: string | Blob;
  size: number;
  mime: string;
}

export interface FormTemplatesResponse {
  id: string;
  title: string;
  file: FormFile;
  slug: string;
}
