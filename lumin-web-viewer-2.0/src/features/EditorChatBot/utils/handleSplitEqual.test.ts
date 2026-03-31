import { handleSplitArray, handleSplitEqualType, handleMessageSplit } from './handleSplitEqual';

describe('handleSplitArray', () => {
  it('should return the original array when n is 1', () => {
    const input = [1, 2, 3, 4, 5];
    const result = handleSplitArray(input, 1);
    expect(result).toEqual([input]);
  });

  it('should split array into equal parts when possible', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const result = handleSplitArray(input, 2);
    expect(result).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it('should handle uneven splits correctly', () => {
    const input = [1, 2, 3, 4, 5];
    const result = handleSplitArray(input, 2);
    expect(result).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });

  it('should handle empty array', () => {
    const input: number[] = [];
    const result = handleSplitArray(input, 3);
    expect(result).toEqual([[], [], []]);
  });

  it('should handle array with single element', () => {
    const input = [1];
    const result = handleSplitArray(input, 2);
    expect(result).toEqual([[1], []]);
  });
});

describe('handleSplitEqualType', () => {
  it('should split page ranges correctly', () => {
    const input = [[1, 2, 3, 4, 5, 6]];
    const result = handleSplitEqualType(input);
    expect(result).toEqual({
      pageRange: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      numberFiles: 1,
    });
  });

  it('should handle multiple input ranges', () => {
    const input = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const result = handleSplitEqualType(input);
    expect(result).toEqual({
      pageRange: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      numberFiles: 2,
    });
  });

  it('should handle uneven page distribution', () => {
    const input = [[1, 2, 3, 4, 5]];
    const result = handleSplitEqualType(input);
    expect(result).toEqual({
      pageRange: [
        [1, 2, 3],
        [4, 5],
      ],
      numberFiles: 1,
    });
  });
});

describe('handleMessageSplit', () => {
  it('should format single page correctly', () => {
    const input = [[1], [2], [3]];
    const result = handleMessageSplit(input);
    expect(result).toEqual(['* File 1: Pages 1\n\n', '* File 2: Pages 2\n\n', '* File 3: Pages 3\n\n']);
  });

  it('should format page ranges correctly', () => {
    const input = [
      [1, 2, 3],
      [4, 5],
    ];
    const result = handleMessageSplit(input);
    expect(result).toEqual(['* File 1: Pages 1-3\n\n', '* File 2: Pages 4-5\n\n']);
  });

  it('should handle mixed single pages and ranges', () => {
    const input = [[1], [2, 3, 4], [5]];
    const result = handleMessageSplit(input);
    expect(result).toEqual(['* File 1: Pages 1\n\n', '* File 2: Pages 2-4\n\n', '* File 3: Pages 5\n\n']);
  });

  it('should handle empty input', () => {
    const input: number[][] = [];
    const result = handleMessageSplit(input);
    expect(result).toEqual([]);
  });
});
