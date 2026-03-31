export interface IThumbnail {
  src: string;
  alt: string;
  templateName: string;
}

export interface IFile {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  provider: string;
  url: string;
  templateName: string;
}
