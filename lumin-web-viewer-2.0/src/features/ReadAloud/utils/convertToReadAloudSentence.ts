import { split, SentenceSplitterSyntax, splitOptions } from 'sentence-splitter';

export interface IReadAloudSentence {
  value: string;
  pageNumber: number;
  isLastSentenceOfPage: boolean;
  isFirstSentenceOfPage: boolean;
}

const SEPARATOR_CHARACTERS = ['.', '!', '?', '...'];

const uppercaseSplitter = (listSentences: string[]) => {
  // Split into new sentence if after the breaking `\n` is an Uppercase letter and not have separator's characters
  const expectedSentences: string[] = [];
  listSentences.forEach((sentence) => {
    const splitted = sentence.split(/(?<=\n)(?=[A-Z0-9])/);
    expectedSentences.push(...splitted);
  });
  return expectedSentences;
};

const sentenceSplitter = (text: string) => {
  const options: splitOptions = {
    SeparatorParser: { separatorCharacters: SEPARATOR_CHARACTERS },
  };
  const sentences = split(text, options).filter((item) => item.type === SentenceSplitterSyntax.Sentence);
  return uppercaseSplitter(sentences.map((sentence, index) => (index > 0 ? ` ${sentence.raw}` : sentence.raw)));
};

export const convertToReadAloudSentence = ({ pageText, pageNumber }: { pageText: string; pageNumber: number }) => {
  const sentences: IReadAloudSentence[] = [];

  const allSentences = sentenceSplitter(pageText);

  if (!allSentences) {
    return null;
  }

  allSentences.forEach((item, index) => {
    const isLastSentenceOfPage = index === allSentences.length - 1;
    sentences.push({
      value: item,
      pageNumber,
      isLastSentenceOfPage,
      isFirstSentenceOfPage: index === 0,
    });
  });

  return sentences;
};
