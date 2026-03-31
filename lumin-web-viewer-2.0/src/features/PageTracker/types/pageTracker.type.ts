import { MANIPULATION_TYPE } from 'constants/lumin-common';

export type PageManipulationType =
  | typeof MANIPULATION_TYPE.INSERT_BLANK_PAGE
  | typeof MANIPULATION_TYPE.REMOVE_PAGE
  | typeof MANIPULATION_TYPE.MOVE_PAGE
  | typeof MANIPULATION_TYPE.MERGE_PAGE;

export type PageManipulationHandlerResult = Map<number, number>;

export type PageManipulationHandler = (params: PageManipulationHandlerParams) => PageManipulationHandlerResult;

export type ManipChangedParams = {
  type: PageManipulationType;
  manipulationPages: number[];
  movedOriginPage?: number;
  mergedPagesCount?: number;
  manipulationId?: string;
};

export type CollabManipChangedParams = {
  type: PageManipulationType;
  id: string;
  option: {
    insertBeforePage?: number;
    pagesToMove?: number;
    pagesRemove?: number[];
    insertPages?: number[];
  };
};

export type PageManipulationHandlerParams = {
  originalPages: number[];
  manipulationData: {
    manipulationPages: number[];
    movedOriginPage?: number;
    mergedPagesCount?: number;
  };
};
