import { MergeDocumentType } from '../../types';
// import { UploadStatus, FileSource } from '../../enum';

import { reorder } from '../documentsManipulation';

describe('documentManipulation', () => {
  describe('reorder', () => {
    // Setup dummy data that mimics MergeDocumentType
    // We cast it to MergeDocumentType to satisfy TypeScript without relying on the specific internal structure of the type
    const item1 = { id: '1', name: 'Document A' } as unknown as MergeDocumentType;
    const item2 = { id: '2', name: 'Document B' } as unknown as MergeDocumentType;
    const item3 = { id: '3', name: 'Document C' } as unknown as MergeDocumentType;

    const initialList: MergeDocumentType[] = [item1, item2, item3];

    it('should move an item from a lower index to a higher index correctly', () => {
      // Move "Document A" (index 0) to index 2 (end)
      const result = reorder(initialList, 0, 2);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe(item2);
      expect(result[1]).toBe(item3);
      expect(result[2]).toBe(item1);
    });

    it('should move an item from a higher index to a lower index correctly', () => {
      // Move "Document C" (index 2) to index 0 (start)
      const result = reorder(initialList, 2, 0);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe(item3);
      expect(result[1]).toBe(item1);
      expect(result[2]).toBe(item2);
    });

    it('should handle moving an item to the immediate next position', () => {
      // Move "Document A" (index 0) to index 1
      const result = reorder(initialList, 0, 1);

      expect(result).toEqual([item2, item1, item3]);
    });

    it('should return the list unchanged if start and end indices are the same', () => {
      const result = reorder(initialList, 1, 1);

      expect(result).toEqual(initialList);
      // Ensure specific order matches exactly
      expect(result[0]).toBe(item1);
      expect(result[1]).toBe(item2);
      expect(result[2]).toBe(item3);
    });

    it('should not mutate the original list', () => {
      reorder(initialList, 0, 2);

      // Verify original list remains intact
      expect(initialList[0]).toBe(item1);
      expect(initialList[1]).toBe(item2);
      expect(initialList[2]).toBe(item3);
      expect(initialList).toHaveLength(3);
    });

    it('should handle lists with a single item', () => {
      const singleItemList = [item1];
      const result = reorder(singleItemList, 0, 0);

      expect(result).toEqual(singleItemList);
      expect(result).toHaveLength(1);
    });

    it('should handle moving the first item to the last position', () => {
      const result = reorder(initialList, 0, 2);
      expect(result).toEqual([item2, item3, item1]);
    });

    it('should handle moving the last item to the first position', () => {
      const result = reorder(initialList, 2, 0);
      expect(result).toEqual([item3, item1, item2]);
    });
  });
});
