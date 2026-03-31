import { OutlineUtils, LOWER_LIMIT } from '../utils/outlineUtils';
describe("Outline Utils", () => {
  describe("getMiddleString", () => {
    it('should return code point of character and position of next character when position still in range of params str', async () => {
      const str = "aac";
      const position = 2;

      const defaultValue = LOWER_LIMIT;

      const expectedCode = str[position].charCodeAt(0);
      const expectedNextIndex = 3;

      const actualResult = OutlineUtils.getCodePointAndNextPosition({
        str,
        position,
        defaultValue,
      });

      expect(actualResult.code).toBe(expectedCode);
      expect(actualResult.position).toBe(expectedNextIndex);
    });

    it('should return default value and current position when position is equal or out of params str range', async () => {
      const str = "aac";
      const position = 3;
      const defaultValue = LOWER_LIMIT;

      const expectedCode = defaultValue;
      const expectedNextIndex = 3;

      const actualResult = OutlineUtils.getCodePointAndNextPosition({
        str,
        position,
        defaultValue,
      });

      expect(actualResult.code).toBe(expectedCode);
      expect(actualResult.position).toBe(expectedNextIndex);
    });

    it('should return first different next, previous character and next character position', () => {
      const prevString = "aac";
      const nextString = "aad";
      const prevDifferentCharacter = 'c';
      const nextDifferentCharacter = 'd';

      const expectedPrevCode = prevDifferentCharacter.charCodeAt(0);
      const expectedNextCode = nextDifferentCharacter.charCodeAt(0);
      const expectedNextIndex = 3;

      const actualResult = OutlineUtils.getFirstDifferentCharacter(prevString, nextString);

      expect(actualResult.firstDiffPrev).toBe(expectedPrevCode);
      expect(actualResult.firstDiffNext).toBe(expectedNextCode);
      expect(actualResult.position).toBe(expectedNextIndex);
    });

    it('should return lower limit, string which is lexicographical lower than next medial string (make from first character to first different character) when prevString is shorter than nextString', () => {
      const prevString = "ac";
      const nextString = "acaabn";

      const expectedIdenticalString = "ac";
      const expectedNextDifferentCharacter = "a";
      const expectedPosition = 3;
      const expectedNextCode = LOWER_LIMIT;
      const expectedMiddleString = "acaaa";

      const { position, firstDiffNext } = OutlineUtils.getFirstDifferentCharacter(prevString, nextString);

      const actualIdenticalString = prevString.slice(0, position - 1);

      const actualResult = OutlineUtils.getFilledCodeAndNextPosition({
        middleString: actualIdenticalString,
        nextString,
        nextCharacterCode: firstDiffNext,
        position,
      });

      expect(actualIdenticalString).toBe(expectedIdenticalString);
      expect(firstDiffNext).toBe(expectedNextDifferentCharacter.charCodeAt(0));
      expect(position).toBe(expectedPosition);
      expect(actualResult.code).toBe(expectedNextCode);
      expect(actualResult.middleString).toBe(expectedMiddleString);
    });

    it('should return prev medial string (make from first character to first different character) which is lexicographical lower than next medial string (make from first character to first different character)', () => {
      const prevString = "acaaan";
      const nextString = "acaabn"

      const expectedIdenticalString = "acaa";
      const expectedMedialString = "acaaa";
      const expectedPrevDifferentPosition = 6;
      const expectedPrevDifferentCharacter = "n";

      const { position, firstDiffPrev } = OutlineUtils.getFirstDifferentCharacter(prevString, nextString);

      const actualIdenticalString = prevString.slice(0, position - 1);

      const actualResult = OutlineUtils.getMedialCodeAndNextPosition({
        prevString,
        middleString: actualIdenticalString,
        prevCharacterCode: firstDiffPrev,
        position,
      });

      expect(actualIdenticalString).toBe(expectedIdenticalString);
      expect(actualResult.middleString).toBe(expectedMedialString);
      expect(actualResult.position).toBe(expectedPrevDifferentPosition);
      expect(actualResult.prevCode).toBe(expectedPrevDifferentCharacter.charCodeAt(0));
    });

    it('should return middle string which is lexicographical between prevString and nextString', () => {
      const prevString = "acaaan";
      const nextString = "acaabn";

      const expectedIdenticalString = "acaa";
      const expectedMedialString = "acaaa";
      const expectedAppendCharacter = "u";
      const expectedMiddleString = "acaaau";

      const { position, firstDiffPrev } = OutlineUtils.getFirstDifferentCharacter(prevString, nextString);

      const actualIdenticalString = prevString.slice(0, position - 1);

      const actualMedialString = OutlineUtils.getMedialCodeAndNextPosition({
        prevString,
        middleString: actualIdenticalString,
        prevCharacterCode: firstDiffPrev,
        position,
      });

      const actualAppendCharacter = String.fromCharCode(Math.ceil((actualMedialString.prevCode + actualMedialString.nextCode) / 2));

      const actualResult = OutlineUtils.getMiddleString(prevString, nextString);

      expect(actualIdenticalString).toBe(expectedIdenticalString);
      expect(actualMedialString.middleString).toBe(expectedMedialString);
      expect(actualAppendCharacter).toBe(expectedAppendCharacter)
      expect(actualResult).toBe(expectedMiddleString);
    });
  });

  describe("getNextLexicalString", () => {
    it('should return next string if params prevString is empty or not passed in and params minCharacter is passed or not passed in', async () => {
      const prevString = "";

      const expectedResult = "ac";

      const actualResult = OutlineUtils.getNextLexicalString(prevString);
  
      expect(actualResult).toBe(expectedResult);
    });

    it('should return next string if params prevString is passed in and minCharacter is not passed in', async () => {
      const prevString = "ac";

      const expectedResult = "ad";

      const actualResult = OutlineUtils.getNextLexicalString(prevString);
  
      expect(actualResult).toBe(expectedResult);
    });

    it('should return next string if params prevString and minCharacter is passed in', async () => {
      const prevString = "ac";
      const minCharacter = 6;

      const expectedResult = "acnnnn";

      const actualResult = OutlineUtils.getNextLexicalString(prevString, minCharacter);
  
      expect(actualResult).toBe(expectedResult);
    });
  });
});
