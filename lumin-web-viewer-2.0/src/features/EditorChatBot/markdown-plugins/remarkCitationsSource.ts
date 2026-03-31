import { visit, SKIP } from 'unist-util-visit';

import logger from 'helpers/logger';

import { CitationPart } from './constants';
import { Node, Tree } from './type';
import { AST_VISIT_CHECK } from '../constants/citationConstant';

const FULL_CITE_REGEX = /(\[cite_start\])([^]*?)(\[cite:([\d,]+)\])/g;
const NUMBER_REGEX = /^\d+$/;
const MAXIMUM_LOOP_COUNT = 1000;
const CITATION_START_REGEX = /\[cite_start\]/g;
const CITATION_END_REGEX = /\[cite:([\d,]*)\]/g;

const isValidTextNode = (node: Node): boolean => Boolean(node.value && typeof node.value === 'string');

const parseValidPageIds = (citationIds: string): string[] =>
  citationIds.split(',').filter((id) => NUMBER_REGEX.test(id));

const createTextNode = (value: string): Partial<Node> => ({
  type: AST_VISIT_CHECK.TEXT,
  value,
});

const createCitedTextNodes = (textContent: string, tagName: string): Node[] =>
  textContent.split('\n').map((line, i, arr) => ({
    type: AST_VISIT_CHECK.ELEMENT,
    tagName,
    children: [{ type: AST_VISIT_CHECK.TEXT, value: i < arr.length - 1 ? `${line}\n` : line }],
    data: {
      hProperties: {
        citationPart: CitationPart.CITED_TEXT,
      },
    },
  })) as Node[];

const createCitationBlockNodes = (ids: string[], tagName: string): Node[] =>
  ids.map((id) => ({
    type: AST_VISIT_CHECK.ELEMENT,
    tagName,
    data: {
      hProperties: {
        citationPart: CitationPart.CITATION_BLOCK,
        page: id,
      },
    },
    children: [{ type: AST_VISIT_CHECK.TEXT, value: id }],
  })) as Node[];

const createCitationContainer = (textContent: string, ids: string[], isInHeading: boolean): Partial<Node> => {
  const tagName = isInHeading ? 'span' : 'div';

  return {
    type: AST_VISIT_CHECK.ELEMENT,
    tagName,
    data: {
      hProperties: {
        citationPart: CitationPart.CITATION_CONTAINER,
      },
    },
    children: [...createCitedTextNodes(textContent, tagName), ...createCitationBlockNodes(ids, tagName)],
  };
};

const cleanCitationMarkers = (text: string): string =>
  text.replace(CITATION_START_REGEX, '').replace(CITATION_END_REGEX, '');

const processTextBeforeMatch = (text: string, lastIndex: number, matchIndex: number): Partial<Node> | null => {
  if (matchIndex > lastIndex) {
    return createTextNode(text.slice(lastIndex, matchIndex));
  }
  return null;
};

const processRemainingText = (text: string, lastIndex: number): Partial<Node> | null => {
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    const cleanedText = cleanCitationMarkers(remainingText);
    return createTextNode(cleanedText);
  }
  return null;
};

const cleanTextNodes = (nodes: Partial<Node>[]): Node[] =>
  nodes.map((node) => ({
    ...node,
    ...(node.type === AST_VISIT_CHECK.TEXT ? { value: cleanCitationMarkers(node.value) } : {}),
  })) as Node[];

const checkLoopLimit = (loopIndex: number): void => {
  if (loopIndex > MAXIMUM_LOOP_COUNT) {
    throw new Error(`Citations source plugin is stuck in an infinite loop (more than ${MAXIMUM_LOOP_COUNT} loop)`);
  }
};

const processCitationMatch = (
  match: RegExpExecArray,
  text: string,
  lastIndex: number,
  parent: Node,
  newNodes: Partial<Node>[]
): void => {
  const textBeforeMatch = processTextBeforeMatch(text, lastIndex, match.index);
  if (textBeforeMatch) {
    newNodes.push(textBeforeMatch);
  }

  const textContent = match[2];
  const citationIds = match[4];
  const ids = parseValidPageIds(citationIds);

  if (ids.length > 0) {
    const isInHeading = parent?.type === 'heading';
    const citationContainer = createCitationContainer(textContent, ids, isInHeading);
    newNodes.push(citationContainer);
  }
};

const processTextNode = (
  node: Node,
  index: number,
  parent: Node,
  loopCounter: { count: number }
): typeof SKIP | [typeof SKIP, number] | null => {
  if (!isValidTextNode(node)) {
    return SKIP;
  }

  const text = node.value;
  const newNodes: Partial<Node>[] = [];
  let lastIndex = 0;
  let match = FULL_CITE_REGEX.exec(text);

  while (match !== null) {
    loopCounter.count++;
    checkLoopLimit(loopCounter.count);

    processCitationMatch(match, text, lastIndex, parent, newNodes);

    lastIndex = FULL_CITE_REGEX.lastIndex;
    match = FULL_CITE_REGEX.exec(text);
  }

  const remainingTextNode = processRemainingText(text, lastIndex);
  if (remainingTextNode) {
    newNodes.push(remainingTextNode);
  }

  if (newNodes.length > 0) {
    const cleanedNodes = cleanTextNodes(newNodes);
    parent.children.splice(index, 1, ...cleanedNodes);
    return [SKIP, index + newNodes.length];
  }

  return null;
};

export const remarkCitationsSource = () => (tree: Tree) => {
  const loopCounter = { count: 0 };

  visit(tree, AST_VISIT_CHECK.TEXT, (node: Node, index: number, parent: Node) => {
    try {
      return processTextNode(node, index, parent, loopCounter);
    } catch (error) {
      logger.logError({
        context: 'remarkCitationsSource',
        error: new Error('Error in remarkCitationsSource', { cause: error }),
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  });
};
