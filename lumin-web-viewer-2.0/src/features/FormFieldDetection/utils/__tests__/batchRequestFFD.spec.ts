import { splitPagesForFFD } from '../batchRequestFFD';

const MAX_PAGE_TO_APPLY_FFD = 15;

describe('splitPagesForFFD', () => {
  describe('when totalPages <= MAX_PAGE_TO_APPLY_FFD (early return branch)', () => {
    it('should return single batch with all pages when totalPages is 0', () => {
      const result = splitPagesForFFD(0);
      expect(result).toEqual([[]]);
    });

    it('should return single batch with all pages when totalPages is 1', () => {
      const result = splitPagesForFFD(1);
      expect(result).toEqual([[1]]);
    });

    it('should return single batch with all pages when totalPages is 5', () => {
      const result = splitPagesForFFD(5);
      expect(result).toEqual([[1, 2, 3, 4, 5]]);
    });

    it('should return single batch with all pages when totalPages equals MAX_PAGE_TO_APPLY_FFD (15)', () => {
      const result = splitPagesForFFD(MAX_PAGE_TO_APPLY_FFD);
      expect(result).toEqual([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]);
    });

    it('should return single batch with all pages when totalPages is less than MAX_PAGE_TO_APPLY_FFD', () => {
      const result = splitPagesForFFD(10);
      expect(result).toEqual([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]);
    });
  });

  describe('when totalPages > MAX_PAGE_TO_APPLY_FFD (loop branch)', () => {
    it('should split into 2 batches when totalPages is 16 (one page over boundary)', () => {
      const result = splitPagesForFFD(16);
      expect(result).toEqual([
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [16],
      ]);
    });

    it('should split into 2 batches when totalPages is 30 (exactly 2 full batches)', () => {
      const result = splitPagesForFFD(30);
      expect(result).toEqual([
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      ]);
    });

    it('should split into 3 batches when totalPages is 31 (2 full batches + 1 page)', () => {
      const result = splitPagesForFFD(31);
      expect(result).toEqual([
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        [31],
      ]);
    });

    it('should split into 3 batches when totalPages is 45 (exactly 3 full batches)', () => {
      const result = splitPagesForFFD(45);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      expect(result[1]).toEqual([16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
      expect(result[2]).toEqual([31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]);
    });

    it('should split into 4 batches when totalPages is 46 (3 full batches + 1 page)', () => {
      const result = splitPagesForFFD(46);
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      expect(result[1]).toEqual([16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
      expect(result[2]).toEqual([31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]);
      expect(result[3]).toEqual([46]);
    });

    it('should split into multiple batches with correct page ranges', () => {
      const result = splitPagesForFFD(50);
      expect(result).toHaveLength(4);
      
      // First batch: pages 1-15
      expect(result[0]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      
      // Second batch: pages 16-30
      expect(result[1]).toEqual([16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
      
      // Third batch: pages 31-45
      expect(result[2]).toEqual([31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]);
      
      // Fourth batch: pages 46-50 (partial batch)
      expect(result[3]).toEqual([46, 47, 48, 49, 50]);
    });

    it('should handle large page counts correctly', () => {
      const result = splitPagesForFFD(100);
      expect(result).toHaveLength(7);
      
      // First batch should be full
      expect(result[0]).toHaveLength(15);
      expect(result[0][0]).toBe(1);
      expect(result[0][14]).toBe(15);
      
      // Last batch should be partial
      expect(result[6]).toHaveLength(10);
      expect(result[6][0]).toBe(91);
      expect(result[6][9]).toBe(100);
    });

    it('should ensure all batches except the last have exactly MAX_PAGE_TO_APPLY_FFD pages', () => {
      const result = splitPagesForFFD(47);
      
      // All batches except the last should have 15 pages
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toHaveLength(MAX_PAGE_TO_APPLY_FFD);
      }
      
      // Last batch should have remaining pages (2 in this case: 46, 47)
      expect(result[result.length - 1]).toHaveLength(2);
      expect(result[result.length - 1]).toEqual([46, 47]);
    });

    it('should ensure page numbers are sequential and correct', () => {
      const result = splitPagesForFFD(33);
      
      let expectedPage = 1;
      for (const batch of result) {
        for (const page of batch) {
          expect(page).toBe(expectedPage);
          expectedPage++;
        }
      }
      
      // Should have processed all 33 pages
      expect(expectedPage).toBe(34);
    });

    it('should handle boundary case where last batch has exactly MAX_PAGE_TO_APPLY_FFD pages', () => {
      const result = splitPagesForFFD(30);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(MAX_PAGE_TO_APPLY_FFD);
      expect(result[1]).toHaveLength(MAX_PAGE_TO_APPLY_FFD);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle very large page counts', () => {
      const result = splitPagesForFFD(1000);
      
      // Should have 67 batches (1000 / 15 = 66.67, rounded up)
      expect(result).toHaveLength(67);
      
      // First batch should start at page 1
      expect(result[0][0]).toBe(1);
      
      // Last batch should end at page 1000
      const lastBatch = result[result.length - 1];
      expect(lastBatch[lastBatch.length - 1]).toBe(1000);
    });

    it('should ensure no pages are skipped or duplicated', () => {
      const totalPages = 47;
      const result = splitPagesForFFD(totalPages);
      
      const allPages: number[] = [];
      for (const batch of result) {
        allPages.push(...batch);
      }
      
      // Should have exactly totalPages pages
      expect(allPages).toHaveLength(totalPages);
      
      // Should be sequential from 1 to totalPages
      expect(allPages).toEqual(Array.from({ length: totalPages }, (_, i) => i + 1));
      
      // Should have no duplicates
      const uniquePages = new Set(allPages);
      expect(uniquePages.size).toBe(totalPages);
    });

    it('should return correct structure: array of arrays', () => {
      const result = splitPagesForFFD(20);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      for (const batch of result) {
        expect(Array.isArray(batch)).toBe(true);
        expect(batch.length).toBeGreaterThan(0);
        
        for (const page of batch) {
          expect(typeof page).toBe('number');
          expect(page).toBeGreaterThan(0);
        }
      }
    });
  });
});
