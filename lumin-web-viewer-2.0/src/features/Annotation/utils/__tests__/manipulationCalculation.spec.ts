import { MANIPULATION_TYPE } from 'constants/lumin-common';
import { calculatePageTransformation } from '../manipulationCalculation';

describe('calculatePageTransformation', () => {
  describe('MOVE_PAGE', () => {
    describe('moving forward (from lower to higher index)', () => {
      it('should move page from index 0 to index 2 and shift intermediate pages down', () => {
        // Move page 1 (0-indexed: 0) to position before page 4 (0-indexed: 3)
        // Pages 0, 1, 2 are affected: 0 -> 2, 1 -> 0, 2 -> 1
        const step = {
          type: MANIPULATION_TYPE.MOVE_PAGE,
          option: { pagesToMove: 1, insertBeforePage: 3 },
        };
        const annotatedPages = [0, 1, 2];

        const result = calculatePageTransformation(step, annotatedPages);

        expect(result[0]).toBe(2); // moved page goes to destination
        expect(result[1]).toBe(0); // intermediate page shifts down
        expect(result[2]).toBe(1); // intermediate page shifts down
      });

      it('should only affect pages within the move range', () => {
        // Move page 2 to position 5 (0-indexed: from 1 to 4)
        const step = {
          type: MANIPULATION_TYPE.MOVE_PAGE,
          option: { pagesToMove: 2, insertBeforePage: 5 },
        };
        const annotatedPages = [0, 1, 2, 3, 4, 5];

        const result = calculatePageTransformation(step, annotatedPages);

        expect(result[0]).toBeUndefined(); // outside range, not affected
        expect(result[1]).toBe(4); // moved page
        expect(result[2]).toBe(1); // shifts down
        expect(result[3]).toBe(2); // shifts down
        expect(result[4]).toBe(3); // shifts down
        expect(result[5]).toBeUndefined(); // outside range
      });

      it('should handle string pagesToMove value', () => {
        const step = {
          type: MANIPULATION_TYPE.MOVE_PAGE,
          option: { pagesToMove: '1', insertBeforePage: 3 },
        };
        const annotatedPages = [0, 1, 2];

        const result = calculatePageTransformation(step, annotatedPages);

        expect(result[0]).toBe(2);
        expect(result[1]).toBe(0);
        expect(result[2]).toBe(1);
      });
    });

    describe('moving backward (from higher to lower index)', () => {
      it('should move page from index 2 to index 0 and shift intermediate pages up', () => {
        // Move page 3 (0-indexed: 2) to position before page 1 (0-indexed: 0)
        // Pages 0, 1, 2 are affected: 2 -> 0, 0 -> 1, 1 -> 2
        const step = {
          type: MANIPULATION_TYPE.MOVE_PAGE,
          option: { pagesToMove: 3, insertBeforePage: 1 },
        };
        const annotatedPages = [0, 1, 2];

        const result = calculatePageTransformation(step, annotatedPages);

        expect(result[2]).toBe(0); // moved page goes to destination
        expect(result[0]).toBe(1); // intermediate page shifts up
        expect(result[1]).toBe(2); // intermediate page shifts up
      });

      it('should only affect pages within the move range', () => {
        // Move page 5 to position 2 (0-indexed: from 4 to 1)
        const step = {
          type: MANIPULATION_TYPE.MOVE_PAGE,
          option: { pagesToMove: 5, insertBeforePage: 2 },
        };
        const annotatedPages = [0, 1, 2, 3, 4, 5];

        const result = calculatePageTransformation(step, annotatedPages);

        expect(result[0]).toBeUndefined(); // outside range
        expect(result[1]).toBe(2); // shifts up
        expect(result[2]).toBe(3); // shifts up
        expect(result[3]).toBe(4); // shifts up
        expect(result[4]).toBe(1); // moved page
        expect(result[5]).toBeUndefined(); // outside range
      });
    });
  });

  describe('REMOVE_PAGE', () => {
    it('should mark removed page for deletion and shift subsequent pages down', () => {
      // Remove page 2 (0-indexed: 1)
      const step = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        option: { pagesRemove: [2] },
      };
      const annotatedPages = [0, 1, 2, 3];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBeUndefined(); // before removed page, unchanged
      expect(result[1]).toBe(-1); // removed page marked for deletion
      expect(result[2]).toBe(1); // shifts down by 1
      expect(result[3]).toBe(2); // shifts down by 1
    });

    it('should handle removing multiple sequential pages', () => {
      // Remove pages 2 and 3 (0-indexed: 1 and 2)
      const step = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        option: { pagesRemove: [2, 3] },
      };
      const annotatedPages = [0, 1, 2, 3, 4];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBeUndefined(); // before removed pages
      expect(result[1]).toBe(-1); // removed
      expect(result[2]).toBe(-1); // removed
      expect(result[3]).toBe(1); // shifts down by 2
      expect(result[4]).toBe(2); // shifts down by 2
    });

    it('should handle removing multiple non-sequential pages', () => {
      // Remove pages 1 and 4 (0-indexed: 0 and 3)
      const step = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        option: { pagesRemove: [1, 4] },
      };
      const annotatedPages = [0, 1, 2, 3, 4];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBe(-1); // removed
      expect(result[1]).toBe(0); // shifts down by 1 (one page removed before it)
      expect(result[2]).toBe(1); // shifts down by 1
      expect(result[3]).toBe(-1); // removed
      expect(result[4]).toBe(2); // shifts down by 2 (two pages removed before it)
    });

    it('should skip transformation when all annotations are before removed pages', () => {
      // Remove page 5 (0-indexed: 4), but annotations are on pages 0, 1, 2
      const step = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        option: { pagesRemove: [5] },
      };
      const annotatedPages = [0, 1, 2];

      const result = calculatePageTransformation(step, annotatedPages);

      // Optimization: no changes needed
      expect(Object.keys(result).length).toBe(0);
    });

    it('should handle removing first page', () => {
      const step = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        option: { pagesRemove: [1] },
      };
      const annotatedPages = [0, 1, 2];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBe(-1); // removed
      expect(result[1]).toBe(0); // shifts down
      expect(result[2]).toBe(1); // shifts down
    });

    it('should handle removing last page when it has annotations', () => {
      const step = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        option: { pagesRemove: [4] },
      };
      const annotatedPages = [0, 1, 2, 3];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBeUndefined();
      expect(result[1]).toBeUndefined();
      expect(result[2]).toBeUndefined();
      expect(result[3]).toBe(-1); // removed
    });

    it('should sort pagesRemove correctly for proper shift calculation', () => {
      // Remove pages in reverse order to test sorting
      const step = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        option: { pagesRemove: [4, 2] }, // unsorted
      };
      const annotatedPages = [0, 1, 2, 3, 4];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBeUndefined();
      expect(result[1]).toBe(-1); // page 2 (0-indexed: 1) removed
      expect(result[2]).toBe(1); // shifts down by 1
      expect(result[3]).toBe(-1); // page 4 (0-indexed: 3) removed
      expect(result[4]).toBe(2); // shifts down by 2
    });
  });

  describe('INSERT_BLANK_PAGE', () => {
    it('should shift pages at or after insertion point up', () => {
      // Insert 1 page at position 2 (0-indexed: 1)
      const step = {
        type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
        option: { insertPages: [2] },
      };
      const annotatedPages = [0, 1, 2, 3];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBeUndefined(); // before insertion, unchanged
      expect(result[1]).toBe(2); // at insertion point, shifts up by 1
      expect(result[2]).toBe(3); // after insertion, shifts up by 1
      expect(result[3]).toBe(4); // after insertion, shifts up by 1
    });

    it('should shift pages up by the number of inserted pages', () => {
      // Insert 3 pages starting at position 2 (0-indexed: 1)
      const step = {
        type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
        option: { insertPages: [2, 3, 4] },
      };
      const annotatedPages = [0, 1, 2];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBeUndefined(); // before insertion
      expect(result[1]).toBe(4); // shifts up by 3
      expect(result[2]).toBe(5); // shifts up by 3
    });

    it('should not affect pages before insertion point', () => {
      // Insert at page 5 (0-indexed: 4)
      const step = {
        type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
        option: { insertPages: [5] },
      };
      const annotatedPages = [0, 1, 2, 3];

      const result = calculatePageTransformation(step, annotatedPages);

      // All annotations are before insertion point
      expect(result[0]).toBeUndefined();
      expect(result[1]).toBeUndefined();
      expect(result[2]).toBeUndefined();
      expect(result[3]).toBeUndefined();
    });

    it('should handle inserting at the beginning', () => {
      // Insert at page 1 (0-indexed: 0)
      const step = {
        type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
        option: { insertPages: [1] },
      };
      const annotatedPages = [0, 1, 2];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBe(1); // all pages shift up
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should return empty map for empty annotated pages array', () => {
      const step = {
        type: MANIPULATION_TYPE.MOVE_PAGE,
        option: { pagesToMove: 1, insertBeforePage: 3 },
      };

      const result = calculatePageTransformation(step, []);

      expect(result).toEqual({});
    });

    it('should return empty map for unknown manipulation type', () => {
      const step = {
        type: 'UNKNOWN_TYPE',
        option: {},
      };
      const annotatedPages = [0, 1, 2];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result).toEqual({});
    });

    it('should handle single annotated page for MOVE_PAGE', () => {
      const step = {
        type: MANIPULATION_TYPE.MOVE_PAGE,
        option: { pagesToMove: 1, insertBeforePage: 3 },
      };
      const annotatedPages = [0];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBe(2); // page 0 moves to position 2
    });

    it('should handle single annotated page for REMOVE_PAGE', () => {
      const step = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        option: { pagesRemove: [1] },
      };
      const annotatedPages = [0];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBe(-1); // marked for deletion
    });

    it('should handle single annotated page for INSERT_BLANK_PAGE', () => {
      const step = {
        type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
        option: { insertPages: [1] },
      };
      const annotatedPages = [0];

      const result = calculatePageTransformation(step, annotatedPages);

      expect(result[0]).toBe(1); // shifts up by 1
    });

    it('should handle annotations not in the affected range for REMOVE_PAGE', () => {
      // Remove page 3 (0-indexed: 2), but only page 0 has annotations
      const step = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        option: { pagesRemove: [3] },
      };
      const annotatedPages = [0, 1];

      const result = calculatePageTransformation(step, annotatedPages);

      // Pages 0 and 1 are before the removed page
      expect(Object.keys(result).length).toBe(0);
    });
  });
});

