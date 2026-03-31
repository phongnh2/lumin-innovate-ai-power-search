import { MANIPULATION_TYPE } from "constants/lumin-common";

export const calculatePageTransformation = (
  step: Record<string, unknown>,
  annotatedPages: number[]
): Record<number, number> => {
  const map: Record<number, number> = {};
  const { type, option } = step;

  switch (type) {
    case MANIPULATION_TYPE.MOVE_PAGE: {
      const { pagesToMove, insertBeforePage } = option as { pagesToMove: string | number; insertBeforePage: number };
      const from = Number(pagesToMove) - 1;
      const to = Number(insertBeforePage) - 1;

      if (from < to) {
        annotatedPages
          .filter((p) => p >= from && p <= to)
          .forEach((p) => {
            if (p === from) map[p] = to;
            else map[p] = p - 1;
          });
      } else {
        annotatedPages
          .filter((p) => p >= to && p <= from)
          .forEach((p) => {
            if (p === from) map[p] = to;
            else map[p] = p + 1;
          });
      }
      break;
    }

    case MANIPULATION_TYPE.REMOVE_PAGE: {
      const { pagesRemove } = option as { pagesRemove: number[] };
      const pagesToRemove = pagesRemove.map((p) => p - 1).sort((a, b) => a - b);
      const firstRemoveIndex = pagesToRemove[0];

      // Optimization: Skip if all annotations are before the first removed page
      if (firstRemoveIndex > annotatedPages[annotatedPages.length - 1]) break;

      annotatedPages
        .filter((p) => p >= firstRemoveIndex)
        .forEach((annotPage) => {
          if (pagesToRemove.includes(annotPage)) {
            map[annotPage] = -1; // Mark for deletion
          } else {
            // Count how many pages strictly before this one were removed
            const shiftAmount = pagesToRemove.filter((p) => annotPage > p).length;
            map[annotPage] = annotPage - shiftAmount;
          }
        });
      break;
    }

    case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
      const { insertPages } = option as { insertPages: number[] };
      const insertCount = insertPages.length;
      // Assuming insertPages are sequential or we just care about the start index
      const insertionIndex = insertPages[0] - 1;

      annotatedPages.forEach((page) => {
        if (page >= insertionIndex) {
          map[page] = page + insertCount;
        }
      });
      break;
    }
    default:
      break;
  }

  return map;
};
