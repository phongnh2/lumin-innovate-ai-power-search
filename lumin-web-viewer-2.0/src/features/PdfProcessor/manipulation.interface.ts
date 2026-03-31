export type RotatePageOption = {
  rotatePages: number[];
  angle: number;
};

export type CropPageOption = {
  pageCrops: number[];
  top: number;
  left: number;
  right: number;
  bottom: number;
};

export type MovePageOption = {
  pagesToMove: number;
  insertBeforePage: number;
};

export type DeletePageOption = {
  pagesRemove: number[];
};
export type InsertBlankPageOption = {
  insertPages: number[];
};

export type ManipulationOption =
  | DeletePageOption
  | CropPageOption
  | MovePageOption
  | RotatePageOption
  | InsertBlankPageOption;
