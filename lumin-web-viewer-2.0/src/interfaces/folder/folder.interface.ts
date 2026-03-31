export interface IFolderLocation {
  _id: string;
  name: string;
}

export interface IFolderBelongsTo {
  type: string;
  location: IFolderLocation;
  _id: string;
  name: string;
}

export interface IFolderPath {
  _id: string;
  name: string;
  path: {
    _id: string;
  };
}

export interface IBreadcrumb {
  _id: string;
  name: string;
}

export interface IFolder {
  breadcrumbs?: IBreadcrumb[];
  _id: string;
  name: string;
  belongsTo: IFolderBelongsTo;
  path?: IFolderPath;
  depth?: number;
  ownerName?: string;
  listUserStar: string[];
  totalDocument?: number;
  folders?: IFolder[];
}
