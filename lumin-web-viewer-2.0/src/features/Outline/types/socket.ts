import { TDocumentOutline } from "interfaces/document/document.interface";

import { OutlineActionType, OutlineMovePosition } from ".";

export type TUpdateDocumentOutlinesParams = {
  action: OutlineActionType;
  isSubOutline?: boolean;
  movePosition?: OutlineMovePosition;
  pathId?: string;
  refId?: string;
  updatedOutlines: Partial<TDocumentOutline>[];
};
