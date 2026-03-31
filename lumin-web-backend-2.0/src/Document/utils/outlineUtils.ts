// 'a' is the first character in the alphabet and used to check if the character is at the beginning of the alphabet.
export const CHAR_CODE_AT_A = 'a'.codePointAt(0);
// 'b' is the second character in the alphabet and used to
// check if needed to append 'a' character in the word to keep the correct lexicographical order.
export const CHAR_CODE_AT_B = 'b'.codePointAt(0);
// 'z' is the last character in the alphabet and used to check if the character is at the end of the alphabet.
export const CHAR_CODE_AT_Z = 'z'.codePointAt(0);
export const UPPER_LIMIT = CHAR_CODE_AT_A - 1;
export const LOWER_LIMIT = CHAR_CODE_AT_Z + 1;
const PATH_SEPARATOR = ',';

export class OutlineUtils {
  static getCodePointAndNextPosition = ({
    str,
    position,
    defaultValue,
  }: { str: string; position: number; defaultValue: number }): { code: number; position: number } => {
    if (position >= str.length) {
      return {
        code: defaultValue,
        position,
      };
    }

    return {
      code: str.codePointAt(position),
      position: position + 1,
    };
  };

  static getFirstDifferentCharacter = (prevString: string, nextString: string): {
    position: number;
    firstDiffPrev: number;
    firstDiffNext: number;
  } => {
    let firstDiffPrev: number;
    let firstDiffNext: number;
    let position = 0;

    while (firstDiffPrev === firstDiffNext) {
      const prevData = this.getCodePointAndNextPosition({ str: prevString, position, defaultValue: UPPER_LIMIT });
      firstDiffPrev = prevData.code;
      const nextData = this.getCodePointAndNextPosition({ str: nextString, position, defaultValue: LOWER_LIMIT });
      firstDiffNext = nextData.code;
      position++;
    }

    return {
      position,
      firstDiffPrev,
      firstDiffNext,
    };
  };

  static getFilledCodeAndNextPosition = ({
    middleString,
    nextString,
    nextCharacterCode,
    position,
  }: {
    middleString: string;
    nextString: string;
    nextCharacterCode: number;
    position: number;
  }): { code: number; middleString: string } => {
    let currentMiddleString = middleString;
    let currentNextCharacter = nextCharacterCode;
    let currentPosition = position;

    while (currentNextCharacter === CHAR_CODE_AT_A) {
      const nextData = this.getCodePointAndNextPosition({ str: nextString, position: currentPosition, defaultValue: LOWER_LIMIT });
      currentNextCharacter = nextData.code;
      currentPosition = nextData.position;
      currentMiddleString += 'a';
    }
    if (currentNextCharacter === CHAR_CODE_AT_B) {
      currentMiddleString += 'a';
      currentNextCharacter = LOWER_LIMIT;
    }

    return {
      code: currentNextCharacter,
      middleString: currentMiddleString,
    };
  };

  static getMedialCodeAndNextPosition = ({
    prevString,
    middleString,
    prevCharacterCode,
    position,
  }: {
    prevString: string;
    middleString: string;
    prevCharacterCode: number;
    position: number;
  }): { prevCode: number; nextCode: number; position: number; middleString: string } => {
    let currentMiddleString = middleString;
    let currentPrevCharacter = prevCharacterCode;
    let currentPosition = position;

    currentMiddleString += String.fromCharCode(currentPrevCharacter);
    const prevData = this.getCodePointAndNextPosition({ str: prevString, position: currentPosition, defaultValue: UPPER_LIMIT });
    currentPrevCharacter = prevData.code;
    currentPosition = prevData.position;

    while (currentPrevCharacter === CHAR_CODE_AT_Z) {
      currentMiddleString += 'z';
      const nextPrevData = this.getCodePointAndNextPosition({ str: prevString, position: currentPosition, defaultValue: UPPER_LIMIT });
      currentPrevCharacter = nextPrevData.code;
      currentPosition = nextPrevData.position;
    }

    return {
      prevCode: currentPrevCharacter,
      position: currentPosition,
      middleString: currentMiddleString,
      nextCode: LOWER_LIMIT,
    };
  };

  static getMiddleString = (prevString: string, nextString: string): string => {
    const { position, firstDiffPrev, firstDiffNext } = this.getFirstDifferentCharacter(prevString, nextString);

    let middleString = prevString.slice(0, position - 1);
    let currentPrevCharacter = firstDiffPrev;
    let currentNextCharacter = firstDiffNext;

    if (currentPrevCharacter === UPPER_LIMIT) {
      const nextData = this.getFilledCodeAndNextPosition({
        middleString,
        nextString,
        nextCharacterCode: currentNextCharacter,
        position,
      });

      middleString = nextData.middleString;
      currentNextCharacter = nextData.code;
    } else if (currentPrevCharacter + 1 === currentNextCharacter) {
      const medialData = this.getMedialCodeAndNextPosition({
        prevString,
        middleString,
        prevCharacterCode: currentPrevCharacter,
        position,
      });

      middleString = medialData.middleString;
      currentPrevCharacter = medialData.prevCode;
      currentNextCharacter = medialData.nextCode;
    }
    return middleString + String.fromCharCode(Math.ceil((currentPrevCharacter + currentNextCharacter) / 2));
  };

  static getNextLexicalString(prevString: string, minCharacter: number = -Infinity): string {
    if (!prevString) {
      return 'ac';
    }

    const arr = [...prevString.split('')];
    let i = arr.length - 1;
    while (arr[i] === 'z' && i >= 0) {
      i--;
    }
    if (i === -1) {
      arr.push('c');
    } else {
      if (arr[i + 1] === 'z') {
        arr[i + 1] = 'c';
      }
      arr[i] = String.fromCharCode(arr[i].charCodeAt(0) + 1);
      if (arr.length < minCharacter) {
        const middleString = this.getMiddleString(prevString, arr.join(''));
        const missingCharacterLength = minCharacter - middleString.length;
        return middleString + Array.from({ length: missingCharacterLength }, () => 'n').join('');
      }
    }
    return arr.join('');
  }

  static generateOutlinePath({ parentPath, parentId }: { parentPath?: string, parentId: string }) {
    return `${parentPath || PATH_SEPARATOR}${parentId}${PATH_SEPARATOR}`;
  }
}
