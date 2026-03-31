import { CitationPart } from './constants';

export type Tree = {
  type: string;
  children: Node[];
};

export type CitationPartType = typeof CitationPart[keyof typeof CitationPart];

export type Node = {
  type: string;
  tagName?: string;
  children: Node[];
  value: string;
  ordered: boolean;
  data: {
    hProperties: {
      dataCitations?: string;
      page?: string;
      citationPart?: CitationPartType;
      className?: string[];
    };
  };
};
