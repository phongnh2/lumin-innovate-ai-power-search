export interface IThumbnailCapabilities {
  pdftocairo: boolean;
  pdfimages: boolean;
  pdftoppm: boolean;
  recommended: string;
  installation: string;
}

export interface IProviderMetadata {
  public_id: string;
  resource_type: string;
}

export interface IFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  provider_metadata: IProviderMetadata;
}

export interface IThumbnailFormats {
  thumbnail: IFormat;
}

export interface IThumbnailAttributes {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: IThumbnailFormats | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: IProviderMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export interface IThumbnail extends Partial<IThumbnailAttributes> {
  id: number;
}

export interface IStrapiThumbnail {
  id: number;
  attributes: IThumbnailAttributes;
}
