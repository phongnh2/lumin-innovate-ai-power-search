import { MergeDocumentType } from '../types';

export const reorder = (list: MergeDocumentType[], startIndex: number, endIndex: number) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};
