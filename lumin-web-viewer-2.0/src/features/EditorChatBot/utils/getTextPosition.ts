import core from 'core';

type TextDocumentPosition = { textToReplace: Set<string>; position: Core.Math.Quad[][] };

export async function getTextPosition(page: number, text: string) {
  return new Promise<Map<number, TextDocumentPosition>>((resolve) => {
    const result = new Map<number, TextDocumentPosition>();
    const searchMode = window.Core.Search.Mode.HIGHLIGHT;
    core.textSearchInit(text, searchMode, {
      fullSearch: true,
      startPage: page,
      endPage: page,
      onResult: ({
        pageNum,
        resultStr,
        quads,
        resultCode,
      }: {
        pageNum: number;
        resultStr: string;
        quads: Core.Math.Quad[];
        resultCode: number;
      }) => {
        const foundResult = resultCode === window.Core.Search.ResultCode.FOUND;
        if (foundResult) {
          if (!result.has(pageNum)) {
            result.set(pageNum, { textToReplace: new Set<string>(), position: new Array<Core.Math.Quad[]>() });
          }
          const { position, textToReplace } = result.get(pageNum);
          position.push(quads.map((q) => q.getPoints()));
          textToReplace.add(resultStr);
        }
      },
      onDocumentEnd: () => {
        resolve(result);
      },
    });
  });
}
