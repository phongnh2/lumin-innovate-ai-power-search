import * as objectUtils from '../objectUtils';

describe('objectUtils', () => {
  describe('isObject', () => {
    test('should be return true', () => {
      expect(objectUtils.isObject({})).toBe(true);
    });
  });
  describe('mergeDeep', () => {
    test('should be return true', () => {
      expect(objectUtils.mergeDeep({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
    });

    test('should merge nested objects', () => {
      const target = { a: 1, nested: { x: 10 } };
      const source = { nested: { y: 20 }, b: 2 };
      const expected = { a: 1, nested: { x: 10, y: 20 }, b: 2 };
      expect(objectUtils.mergeDeep(target, source)).toEqual(expected);
    });

    test('should overwrite non-object with object', () => {
      const target = { a: 1, nested: 5 };
      const source = { nested: { y: 20 } };
      const expected = { a: 1, nested: { y: 20 } };
      expect(objectUtils.mergeDeep(target, source)).not.toBeNull();
    });
  });
});
