import Fuse from 'fuse.js';

import {
  DATA_IDENTITY,
  isAutocompleteItem,
  getNextWrappingIndex,
  fuseSortFn,
} from '../utils';

jest.mock('fuse.js');

describe('FormFieldAutosuggest Utils', () => {
  describe('isAutocompleteItem', () => {
    it('should return true when element is an HTMLLIElement with the correct data-identity', () => {
      const li = document.createElement('li');
      li.setAttribute('data-identity', DATA_IDENTITY);

      expect(isAutocompleteItem(li)).toBe(true);
    });

    it('should return false when element is not an HTMLLIElement', () => {
      const div = document.createElement('div');
      div.setAttribute('data-identity', DATA_IDENTITY);

      expect(isAutocompleteItem(div)).toBe(false);
    });

    it('should return false when element has an incorrect data-identity', () => {
      const li = document.createElement('li');
      li.setAttribute('data-identity', 'wrong-identity');

      expect(isAutocompleteItem(li)).toBe(false);
    });

    it('should return false when element is null or undefined', () => {
      expect(isAutocompleteItem(null)).toBe(false);
    });
  });

  describe('getNextWrappingIndex', () => {
    const itemCount = 5; // Indexes 0 to 4

    it('should return -1 if itemCount is 0', () => {
      expect(getNextWrappingIndex(1, 0, 0)).toBe(-1);
    });

    it('should increment the index normally when moving forward within bounds', () => {
      expect(getNextWrappingIndex(1, 0, itemCount)).toBe(1);
      expect(getNextWrappingIndex(1, 2, itemCount)).toBe(3);
    });

    it('should decrement the index normally when moving backward within bounds', () => {
      expect(getNextWrappingIndex(-1, 4, itemCount)).toBe(3);
      expect(getNextWrappingIndex(-1, 2, itemCount)).toBe(1);
    });

    it('should wrap to the first item (0) when incrementing past the last item', () => {
      expect(getNextWrappingIndex(1, 4, itemCount)).toBe(0);
    });

    it('should wrap to the last item when decrementing below 0', () => {
      expect(getNextWrappingIndex(-1, 0, itemCount)).toBe(4);
    });

    describe('invalid baseIndex handling', () => {
      it('should start from index 0 if baseIndex is invalid and moving forward', () => {
        // baseIndex -1 + moveAmount 1 = 0
        expect(getNextWrappingIndex(1, -1, itemCount)).toBe(0);

        expect(getNextWrappingIndex(1, null, itemCount)).toBe(0);
      });

      it('should start from last index if baseIndex is invalid and moving backward', () => {
        // baseIndex (itemCount) + moveAmount -1 = 4
        expect(getNextWrappingIndex(-1, 10, itemCount)).toBe(4);
      });
    });
  });

  describe('fuseSortFn', () => {
    it('should sort by score in ascending order', () => {
      const itemA = { score: 0.1, item: { content: 'apple', count: 1, dateStamp: 1000 }, idx: 0 } as unknown as Fuse.FuseSortFunctionArg;
      const itemB = { score: 0.5, item: { content: 'banana', count: 1, dateStamp: 1000 }, idx: 1 } as unknown as Fuse.FuseSortFunctionArg;

      expect(fuseSortFn(itemA, itemB)).toBe(-1);
      expect(fuseSortFn(itemB, itemA)).toBe(1);
    });

    it('should return 1 when scores are identical (object comparison always false)', () => {
      const itemA = { score: 0.2, item: { content: 'apple', count: 1, dateStamp: 1000 }, idx: 0 } as unknown as Fuse.FuseSortFunctionArg;
      const itemB = { score: 0.2, item: { content: 'banana', count: 1, dateStamp: 1000 }, idx: 1 } as unknown as Fuse.FuseSortFunctionArg;

      expect(fuseSortFn(itemA, itemB)).toBe(1);
      expect(fuseSortFn(itemB, itemA)).toBe(1);
    });
  });
});