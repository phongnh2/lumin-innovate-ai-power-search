import { avoidNonOrphansWord } from '../string.utils';

const NON_BREAKING_SPACE = '\u00A0';
const NON_BREAKING_SPACE_CHAR = String.fromCharCode(160);
const HELLO_WORLD = 'hello world';

describe('avoidNonOrphansWord', () => {
  describe('Edge Cases', () => {
    it('should return empty string for null input', () => {
      expect(avoidNonOrphansWord(null as any)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(avoidNonOrphansWord(undefined as any)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(avoidNonOrphansWord('')).toBe('');
    });
  });

  describe('Single Word', () => {
    it('should return the same string for single word', () => {
      expect(avoidNonOrphansWord('hello')).toBe('hello');
    });
  });

  describe('Two Words', () => {
    it('should add non-breaking space between two words', () => {
      const result = avoidNonOrphansWord(HELLO_WORLD);
      // Check that the result contains the non-breaking space character (char code 160)
      expect(result).toBe(`hello${NON_BREAKING_SPACE}world`);
    });

    it('should handle two words with special characters', () => {
      const result = avoidNonOrphansWord('hello-world test');
      expect(result).toBe(`hello-world${NON_BREAKING_SPACE}test`);
    });
  });

  describe('Multiple Words', () => {
    it('should add non-breaking spaces only to first and last words', () => {
      const result = avoidNonOrphansWord('hello world test');
      expect(result).toBe(`hello${NON_BREAKING_SPACE}world${NON_BREAKING_SPACE}test`);
    });

    it('should handle three words correctly', () => {
      const result = avoidNonOrphansWord('one two three');
      expect(result).toBe(`one${NON_BREAKING_SPACE}two${NON_BREAKING_SPACE}three`);
    });

    it('should handle four words correctly', () => {
      const result = avoidNonOrphansWord('one two three four');
      expect(result).toBe(`one${NON_BREAKING_SPACE}two three${NON_BREAKING_SPACE}four`);
    });
  });

  describe('Special Cases', () => {
    it('should handle words with numbers', () => {
      const result = avoidNonOrphansWord('test 123 world');
      expect(result).toBe(`test${NON_BREAKING_SPACE}123${NON_BREAKING_SPACE}world`);
    });

    it('should handle words with punctuation', () => {
      const result = avoidNonOrphansWord('hello, world!');
      expect(result).toBe(`hello,${NON_BREAKING_SPACE}world!`);
    });

    it('should handle words with emojis', () => {
      const result = avoidNonOrphansWord('hello 😀 world');
      expect(result).toBe(`hello${NON_BREAKING_SPACE}😀${NON_BREAKING_SPACE}world`);
    });

    it('should handle words with accented characters', () => {
      const result = avoidNonOrphansWord('café world');
      expect(result).toBe(`café${NON_BREAKING_SPACE}world`);
    });
  });

  describe('Non-breaking Space Character', () => {
    it('should use the correct non-breaking space character (char code 160)', () => {
      const result = avoidNonOrphansWord(HELLO_WORLD);
      expect(result).toBe(`hello${NON_BREAKING_SPACE_CHAR}world`);
    });

    it('should not use regular space character', () => {
      const result = avoidNonOrphansWord(HELLO_WORLD);
      expect(result).not.toBe(HELLO_WORLD);
    });
  });

  describe('String Manipulation Verification', () => {
    it('should preserve original string length plus non-breaking spaces', () => {
      const input = 'hello world test';
      const result = avoidNonOrphansWord(input);

      // Original has 2 spaces, result should have 2 non-breaking spaces
      expect(result.length).toBe(input.length);
      expect(result.split(NON_BREAKING_SPACE_CHAR)).toHaveLength(3);
    });
  });
});
