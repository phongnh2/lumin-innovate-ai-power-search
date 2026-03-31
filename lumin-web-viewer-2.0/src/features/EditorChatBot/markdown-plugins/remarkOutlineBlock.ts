import { visit } from 'unist-util-visit';

import { Node, Tree } from './type';
import { OUTLINE_MARKER, OUTLINE_MARKER_TEXT } from '../constants';

const checkOutlineMarker = (text: string) => text.includes(OUTLINE_MARKER);

export const remarkOutlineBlock = () => (tree: Tree) => {
  visit(tree, 'heading', (node: Node, index: number, parent: Node) => {
    if (!node.children || node.children.length === 0 || node.children[0].type !== 'text') {
      return;
    }

    const headingText = node.children[0].value;
    if (!checkOutlineMarker(headingText)) {
      return;
    }

    if (!node.data) {
      node.data = {} as Node['data'];
    }

    node.children[0].value = headingText.replace(OUTLINE_MARKER_TEXT, '').trim();
    const nextSibling = parent.children[index + 1];
    if (!nextSibling || nextSibling.type !== 'list' || nextSibling.ordered) {
      return;
    }

    if (!nextSibling.data) {
      nextSibling.data = {} as Node['data'];
    }

    nextSibling.data.hProperties = {
      ...nextSibling.data.hProperties,
      className: ['outline-list', ...(nextSibling.data.hProperties?.className || [])],
    };
  });
};
