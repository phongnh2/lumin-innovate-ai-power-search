import array from '../array';

describe('array function', () => {
  describe('remove element from array', () => {
    test('remove index between 1 and array length', () => {
      expect(array.removeElementFromArrayByIndex({ array: [1, 2, 3], removeIndex: 2 })).toEqual([1, 3]);
    });

    test('remove index greater than array length', () => {
      expect(array.removeElementFromArrayByIndex({ array: [1, 2, 3], removeIndex: 4 })).toEqual([1, 2, 3]);
    });

    test('remove index less than 1', () => {
      expect(array.removeElementFromArrayByIndex({ array: [1, 2, 3], removeIndex: 0 })).toEqual([1, 2, 3]);
    });
  });

  describe('removeByIndex', () => {
    test('remove index between 1 and array length', () => {
      expect(array.removeByIndex([1, 2, 3], 2)).toEqual([1, 2]);
    });
  });

  describe('createRangeArray', () => {
    test('create range array between 1 and 3', () => {
      expect(array.createRangeArray(1, 3)).toEqual([1, 2, 3]);
    });
  });

  describe('removeElementsByRange', () => {
    test('remove elements between 1 and 3', () => {
      expect(array.removeElementsByRange({ array: [1, 2, 3, 4, 5], from: 1, to: 3 })).toEqual([4, 5]);
    });
  });

  describe('reOrderItem', () => {
    test('reorder item between 1 and 3', () => {
      expect(array.reOrderItem({ array: [1, 2, 3], from: 1, to: 3 })).toEqual([1, 3, 2]);
    });
  });

  describe('createFontsizeArray', () => {
    test('create fontsize array between 1 and 3', () => {
      expect(array.createFontsizeArray(1, 3)).not.toBeNull();
    });
  });

  describe('compare string of array', () => {
    test('should be return false', () => {
      expect(array.compareStringArray(['abc', 'def'], ['abc', 'oaka'])).toBe(false);
      expect(array.compareStringArray(['abc', 'def'], ['abc'])).toBe(false);
    });
    test('should be return true', () => {
      expect(array.compareStringArray(['abc', 'def'], ['abc', 'def'])).toBe(true);
    });
  });
});


