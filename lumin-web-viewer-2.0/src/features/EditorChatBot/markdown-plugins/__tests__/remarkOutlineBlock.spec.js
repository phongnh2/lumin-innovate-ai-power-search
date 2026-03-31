import { remarkOutlineBlock } from '../remarkOutlineBlock';

describe('remarkOutlineBlock', () => {
  const createTextNode = (value) => ({
    type: 'text',
    value,
    children: [],
    ordered: false,
    data: {
      hProperties: {},
    },
  });

  const createHeadingNode = (text) => ({
    type: 'heading',
    children: [createTextNode(text)],
    ordered: false,
    data: {
      hProperties: {},
    },
  });

  const createListNode = (ordered = false, className) => ({
    type: 'list',
    ordered,
    children: [],
    value: '',
    data: {
      hProperties: {
        ...(className ? { className } : {}),
      },
    },
  });

  describe('when heading contains outline marker', () => {
    it('should add outline-list className to following unordered list', () => {
      const tree = {
        type: 'root',
        children: [
          createHeadingNode('Outlines {outline-list}'),
          createListNode(false),
        ],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      const listNode = tree.children[1];
      expect(listNode.data.hProperties?.className).toContain('outline-list');
    });

    it('should remove outline marker from heading text', () => {
      const tree = {
        type: 'root',
        children: [
          createHeadingNode('Outlines {outline-list}'),
          createListNode(false),
        ],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      const headingNode = tree.children[0];
      expect(headingNode.children[0].value).toBe('');
    });

    it('should preserve existing className on list', () => {
      const tree = {
        type: 'root',
        children: [
          createHeadingNode('Outlines {outline-list}'),
          createListNode(false, ['existing-class']),
        ],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      const listNode = tree.children[1];
      expect(listNode.data.hProperties?.className).toEqual(['outline-list', 'existing-class']);
    });

    it('should initialize data if not present on heading', () => {
      const heading = {
        type: 'heading',
        children: [createTextNode('Outlines {outline-list}')],
        ordered: false,
        value: '',
        data: undefined,
      };

      const tree = {
        type: 'root',
        children: [heading, createListNode(false)],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      expect(heading.data).toBeDefined();
    });

    it('should initialize data if not present on list', () => {
      const list = {
        type: 'list',
        children: [],
        ordered: false,
        value: '',
        data: undefined,
      };

      const tree = {
        type: 'root',
        children: [createHeadingNode('Outlines {outline-list}'), list],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      expect(list.data).toBeDefined();
      expect(list.data.hProperties?.className).toContain('outline-list');
    });
  });

  describe('when heading does not contain outline marker', () => {
    it('should not modify heading without marker', () => {
      const tree = {
        type: 'root',
        children: [
          createHeadingNode('Regular Heading'),
          createListNode(false),
        ],
      };

      const originalHeadingText = tree.children[0].children[0].value;
      const originalListClassName = tree.children[1].data.hProperties?.className;

      const plugin = remarkOutlineBlock();
      plugin(tree);

      expect(tree.children[0].children[0].value).toBe(originalHeadingText);
      expect(tree.children[1].data.hProperties?.className).toEqual(originalListClassName);
    });

    it('should not modify list when heading has no marker', () => {
      const tree = {
        type: 'root',
        children: [
          createHeadingNode('Regular Heading'),
          createListNode(false, ['existing-class']),
        ],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      const listNode = tree.children[1];
      expect(listNode.data.hProperties?.className).toEqual(['existing-class']);
      expect(listNode.data.hProperties?.className).not.toContain('outline-list');
    });
  });

  describe('when next sibling is not an unordered list', () => {
    it('should not modify ordered list', () => {
      const tree = {
        type: 'root',
        children: [
          createHeadingNode('Outlines {outline-list}'),
          createListNode(true),
        ],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      const listNode = tree.children[1];
      expect(listNode.data.hProperties?.className).toBeUndefined();
    });

    it('should not modify when next sibling is not a list', () => {
      const paragraph = {
        type: 'paragraph',
        children: [createTextNode('Some text')],
        ordered: false,
        value: '',
        data: {
          hProperties: {},
        },
      };

      const tree = {
        type: 'root',
        children: [
          createHeadingNode('Outlines {outline-list}'),
          paragraph,
        ],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      expect(paragraph.data.hProperties?.className).toBeUndefined();
    });

    it('should not modify when there is no next sibling', () => {
      const tree = {
        type: 'root',
        children: [createHeadingNode('Outlines {outline-list}')],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      expect(tree.children.length).toBe(1);
    });
  });

  describe('when heading has invalid structure', () => {
    it('should not modify when heading has no children', () => {
      const heading = {
        type: 'heading',
        children: [],
        ordered: false,
        value: '',
        data: {
          hProperties: {},
        },
      };

      const tree = {
        type: 'root',
        children: [heading, createListNode(false)],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      const listNode = tree.children[1];
      expect(listNode.data.hProperties?.className).toBeUndefined();
    });

    it('should not modify when first child is not text type', () => {
      const heading = {
        type: 'heading',
        children: [
          {
            type: 'strong',
            children: [createTextNode('Outlines {outline-list}')],
            ordered: false,
            value: '',
            data: {
              hProperties: {},
            },
          },
        ],
        ordered: false,
        value: '',
        data: {
          hProperties: {},
        },
      };

      const tree = {
        type: 'root',
        children: [heading, createListNode(false)],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      const listNode = tree.children[1];
      expect(listNode.data.hProperties?.className).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle heading with only marker text', () => {
      const tree = {
        type: 'root',
        children: [
          createHeadingNode('Outlines {outline-list}'),
          createListNode(false),
        ],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      const headingNode = tree.children[0];
      expect(headingNode.children[0].value.trim()).toBe('');
    });

    it('should handle heading with text before and after marker', () => {
      const tree = {
        type: 'root',
        children: [
          createHeadingNode('Chapter 1 Outlines {outline-list} Summary'),
          createListNode(false),
        ],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      const headingNode = tree.children[0];
      expect(headingNode.children[0].value.trim()).toBe('Chapter 1  Summary');
    });

    it('should handle multiple headings with only one having marker', () => {
      const tree = {
        type: 'root',
        children: [
          createHeadingNode('Regular Heading'),
          createListNode(false),
          createHeadingNode('Outlines {outline-list}'),
          createListNode(false),
        ],
      };

      const plugin = remarkOutlineBlock();
      plugin(tree);

      const firstList = tree.children[1];
      const secondList = tree.children[3];

      expect(firstList.data.hProperties?.className).toBeUndefined();
      expect(secondList.data.hProperties?.className).toContain('outline-list');
    });
  });
});

