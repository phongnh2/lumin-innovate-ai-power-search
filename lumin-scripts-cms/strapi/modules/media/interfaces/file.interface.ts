import { IProviderMetadata } from "./thumbnail.interface.ts";

export interface IFileAttributes {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: unknown | null;
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

export interface IFile extends Partial<IFileAttributes> {
  id: number;
}

export interface IStrapiFile {
  id: number;
  attributes: IFileAttributes;
}
