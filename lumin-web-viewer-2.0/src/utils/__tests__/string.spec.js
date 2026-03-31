import string from '../string';

describe('string function', () => {
  describe('getShortString', () => {
    it('getShortString should return null', () => {
      const output = string.getShortString('');
      expect(output).toBeNull();
    });

    it('getShortString should return string with 30 characters limit', () => {
      global.innerWidth = 300;
      const output = string.getShortString('Lorem ipsum dolor sit.');
      expect(output).toBe('Lorem ipsum dolor sit.');
    });

    it('getShortString should return string with 30 characters limit and three dots', () => {
      global.innerWidth = 300;
      const output = string.getShortString(
        'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Cumque ullam magni voluptate delectus. Corporis, officia animi. Recusandae dolores tempora deleniti!',
      );
      expect(output).toBe('Lorem ipsum dolor sit, amet co...');
    });

    it('getShortString should return string with 35 characters limit and three dots', () => {
      global.innerWidth = 500;
      const output = string.getShortString(
        'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Cumque ullam magni voluptate delectus. Corporis, officia animi. Recusandae dolores tempora deleniti!',
      );
      expect(output).toBe('Lorem ipsum dolor sit, amet consect...');
    });

    it('getShortString should return string with 40 characters limit and three dots', () => {
      global.innerWidth = 1300;
      const output = string.getShortString(
        'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Cumque ullam magni voluptate delectus. Corporis, officia animi. Recusandae dolores tempora deleniti!',
      );
      expect(output).toBe('Lorem ipsum dolor sit, amet consectetur ...');
    });
  });

  describe('getShortStringWithLimit', () => {
    it('should return null', () => {
      expect(string.getShortStringWithLimit('', 10)).toBeNull();
      expect(string.getShortStringWithLimit(undefined, 10)).toBeNull();
    });

    it('string length greater than limit', () => {
      const output = string.getShortStringWithLimit(
        'Lorem ipsum dolor sit.',
        10,
      );
      expect(output).toBe('Lorem ipsu...');
    });

    it('string length less than limit', () => {
      const output = string.getShortStringWithLimit(
        'Lorem ipsum dolor sit.',
        100,
      );
      expect(output).toBe('Lorem ipsum dolor sit.');
    });
  });
});
