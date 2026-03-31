export interface IStrapiCategory {
  id: string,
  name: string,
  slug: string,
}
export interface ITemplateStrapiFile {
  name: string,
  hash: string,
  ext: string,
  mime: string,
  size: number,
  provider: string,
  url: string,
  templateName: string
}
export interface IStrapiTemplate {
  id: string,
  name: string,
  title: string,
  file: ITemplateStrapiFile,
  thumbnails: ITemplateStrapiFile[],
  publishedDate: string,
  fileSize: number,
  categories: IStrapiCategory[],
}
