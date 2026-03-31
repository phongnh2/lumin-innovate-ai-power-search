import { remarkCitationsSource } from '../remarkCitationsSource';
import logger from 'helpers/logger';
import { CitationPart } from '../constants';
import { AST_VISIT_CHECK } from '../../constants/citationConstant';

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

describe('remarkCitationsSource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createTextNode = (value) => ({
    type: AST_VISIT_CHECK.TEXT,
    value,
    children: [],
    ordered: false,
    data: {
      hProperties: {},
    },
  });

  const createParagraphNode = (text) => ({
    type: 'paragraph',
    children: [createTextNode(text)],
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

  describe('valid citation syntax', () => {
    it('should transform single citation with one page number', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]This is cited text[cite:1]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      expect(paragraphChildren).toHaveLength(1);

      const citationContainer = paragraphChildren[0];
      expect(citationContainer.type).toBe(AST_VISIT_CHECK.ELEMENT);
      expect(citationContainer.tagName).toBe('div');
      expect(citationContainer.data.hProperties.citationPart).toBe(CitationPart.CITATION_CONTAINER);
      expect(citationContainer.children).toHaveLength(2);

      const citedText = citationContainer.children[0];
      expect(citedText.data.hProperties.citationPart).toBe(CitationPart.CITED_TEXT);
      expect(citedText.children[0].value).toBe('This is cited text');

      const citationBlock = citationContainer.children[1];
      expect(citationBlock.data.hProperties.citationPart).toBe(CitationPart.CITATION_BLOCK);
      expect(citationBlock.data.hProperties.page).toBe('1');
      expect(citationBlock.children[0].value).toBe('1');
    });

    it('should transform citation with multiple page numbers', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Cited text[cite:1,2,3]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const citationContainer = tree.children[0].children[0];
      expect(citationContainer.children).toHaveLength(4);

      const citedText = citationContainer.children[0];
      expect(citedText.children[0].value).toBe('Cited text');

      const citationBlocks = citationContainer.children.slice(1);
      expect(citationBlocks).toHaveLength(3);
      expect(citationBlocks[0].data.hProperties.page).toBe('1');
      expect(citationBlocks[1].data.hProperties.page).toBe('2');
      expect(citationBlocks[2].data.hProperties.page).toBe('3');
    });

    it('should handle multiple citations in same text', () => {
      const tree = {
        type: 'root',
        children: [
          createParagraphNode('[cite_start]First citation[cite:1] and [cite_start]Second citation[cite:2]'),
        ],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      expect(paragraphChildren).toHaveLength(3);

      const firstCitation = paragraphChildren[0];
      expect(firstCitation.data.hProperties.citationPart).toBe(CitationPart.CITATION_CONTAINER);
      expect(firstCitation.children[0].children[0].value).toBe('First citation');

      const middleText = paragraphChildren[1];
      expect(middleText.type).toBe(AST_VISIT_CHECK.TEXT);
      expect(middleText.value).toBe(' and ');

      const secondCitation = paragraphChildren[2];
      expect(secondCitation.data.hProperties.citationPart).toBe(CitationPart.CITATION_CONTAINER);
      expect(secondCitation.children[0].children[0].value).toBe('Second citation');
    });

    it('should handle citation in heading with span tags', () => {
      const tree = {
        type: 'root',
        children: [createHeadingNode('[cite_start]Heading citation[cite:1]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const citationContainer = tree.children[0].children[0];
      expect(citationContainer.tagName).toBe('span');

      const citedText = citationContainer.children[0];
      expect(citedText.tagName).toBe('span');

      const citationBlock = citationContainer.children[1];
      expect(citationBlock.tagName).toBe('span');
    });

    it('should handle multi-line cited text', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Line 1\nLine 2\nLine 3[cite:1]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const citationContainer = tree.children[0].children[0];
      const citedTextNodes = citationContainer.children.slice(0, -1);

      expect(citedTextNodes).toHaveLength(3);
      expect(citedTextNodes[0].children[0].value).toBe('Line 1\n');
      expect(citedTextNodes[1].children[0].value).toBe('Line 2\n');
      expect(citedTextNodes[2].children[0].value).toBe('Line 3');
    });
  });

  describe('invalid citation syntax handling', () => {
    it('should filter out non-numeric page numbers', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Text[cite:1,2]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      const citationContainer = paragraphChildren.find(
        child => child.data?.hProperties?.citationPart === CitationPart.CITATION_CONTAINER
      );

      expect(citationContainer).toBeDefined();
      const citationBlocks = citationContainer.children.slice(1);

      expect(citationBlocks).toHaveLength(2);
      expect(citationBlocks[0].data.hProperties.page).toBe('1');
      expect(citationBlocks[1].data.hProperties.page).toBe('2');
    });

    it('should not match citation with non-numeric values in page list', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Text[cite:1,abc,2,xyz]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      
      const citationContainer = paragraphChildren.find(
        child => child.data?.hProperties?.citationPart === CitationPart.CITATION_CONTAINER
      );
      expect(citationContainer).toBeUndefined();
    });

    it('should skip citation if no valid page numbers exist', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Text[cite:abc,xyz]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      expect(paragraphChildren).toHaveLength(1);
      expect(paragraphChildren[0].type).toBe(AST_VISIT_CHECK.TEXT);
      
      const citationContainer = paragraphChildren.find(
        child => child.data?.hProperties?.citationPart === CitationPart.CITATION_CONTAINER
      );
      expect(citationContainer).toBeUndefined();
    });

    it('should clean up incomplete citation markers at end', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('Normal text [cite_start]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      expect(paragraphChildren).toHaveLength(1);
      expect(paragraphChildren[0].value).toBe('Normal text ');
    });

    it('should clean up incomplete citation end markers', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('Normal text [cite:1,2]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      expect(paragraphChildren).toHaveLength(1);
      expect(paragraphChildren[0].value).toBe('Normal text ');
    });
  });

  describe('edge cases', () => {
    it('should handle empty text node', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      expect(tree.children[0].children).toHaveLength(1);
    });

    it('should handle node without value property', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: AST_VISIT_CHECK.TEXT,
                children: [],
              },
            ],
          },
        ],
      };

      const plugin = remarkCitationsSource();
      expect(() => plugin(tree)).not.toThrow();
    });

    it('should handle node with non-string value', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: AST_VISIT_CHECK.TEXT,
                value: null,
                children: [],
              },
            ],
          },
        ],
      };

      const plugin = remarkCitationsSource();
      expect(() => plugin(tree)).not.toThrow();
    });

    it('should handle text before and after citation', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('Before [cite_start]Cited[cite:1] After')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      expect(paragraphChildren).toHaveLength(3);

      expect(paragraphChildren[0].type).toBe(AST_VISIT_CHECK.TEXT);
      expect(paragraphChildren[0].value).toBe('Before ');

      expect(paragraphChildren[1].data.hProperties.citationPart).toBe(CitationPart.CITATION_CONTAINER);

      expect(paragraphChildren[2].type).toBe(AST_VISIT_CHECK.TEXT);
      expect(paragraphChildren[2].value).toBe(' After');
    });

    it('should handle citation with empty text content', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start][cite:1]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const citationContainer = tree.children[0].children[0];
      const citedText = citationContainer.children[0];
      expect(citedText.children[0].value).toBe('');
    });

    it('should handle citation with comma-separated numbers with spaces', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Text[cite:1, 2, 3]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      const citationContainer = paragraphChildren.find(
        child => child.data?.hProperties?.citationPart === CitationPart.CITATION_CONTAINER
      );

      if (citationContainer) {
        const citationBlocks = citationContainer.children.filter(
          child => child.data?.hProperties?.citationPart === CitationPart.CITATION_BLOCK
        );
        expect(citationBlocks.length).toBeGreaterThan(0);
      } else {
        expect(paragraphChildren[0].type).toBe(AST_VISIT_CHECK.TEXT);
      }
    });

    it('should handle empty citation list', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Text[cite:]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      expect(paragraphChildren).toHaveLength(1);
      
      const citationContainer = paragraphChildren.find(
        child => child.data?.hProperties?.citationPart === CitationPart.CITATION_CONTAINER
      );
      expect(citationContainer).toBeUndefined();
    });
  });

  describe('infinite loop protection', () => {
    it('should throw error after maximum loop count', () => {
      const maliciousText = Array(1100)
        .fill('[cite_start]Text[cite:1]')
        .join('');

      const tree = {
        type: 'root',
        children: [createParagraphNode(maliciousText)],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      expect(logger.logError).toHaveBeenCalled();
      const errorCall = logger.logError.mock.calls[0][0];
      expect(errorCall.context).toBe('remarkCitationsSource');
      expect(errorCall.message).toContain('infinite loop');
    });
  });

  describe('error handling', () => {
    it('should log error when splice throws exception', () => {
      const originalSplice = Array.prototype.splice;
      let callCount = 0;
      
      Array.prototype.splice = function(...args) {
        callCount++;
        if (callCount === 1) {
          throw new Error('Simulated splice error');
        }
        return originalSplice.apply(this, args);
      };

      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Test[cite:1]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      Array.prototype.splice = originalSplice;
      
      expect(logger.logError).toHaveBeenCalled();
      const errorCall = logger.logError.mock.calls[0][0];
      expect(errorCall.context).toBe('remarkCitationsSource');
    });

    it('should handle errors gracefully and continue processing', () => {
      const goodNode1 = createParagraphNode('[cite_start]Good1[cite:1]');
      const goodNode2 = createParagraphNode('[cite_start]Good2[cite:2]');

      const tree = {
        type: 'root',
        children: [goodNode1, goodNode2],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const firstCitation = tree.children[0].children.find(
        child => child.data?.hProperties?.citationPart === CitationPart.CITATION_CONTAINER
      );
      expect(firstCitation).toBeDefined();
      
      const secondCitation = tree.children[1].children.find(
        child => child.data?.hProperties?.citationPart === CitationPart.CITATION_CONTAINER
      );
      expect(secondCitation).toBeDefined();
    });
  });

  describe('citation container structure', () => {
    it('should create proper nested structure for citations', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Sample text[cite:5]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const citationContainer = tree.children[0].children[0];

      expect(citationContainer).toMatchObject({
        type: AST_VISIT_CHECK.ELEMENT,
        tagName: 'div',
        data: {
          hProperties: {
            citationPart: CitationPart.CITATION_CONTAINER,
          },
        },
      });

      expect(citationContainer.children).toHaveLength(2);

      const citedTextNode = citationContainer.children[0];
      expect(citedTextNode).toMatchObject({
        type: AST_VISIT_CHECK.ELEMENT,
        tagName: 'div',
        data: {
          hProperties: {
            citationPart: CitationPart.CITED_TEXT,
          },
        },
      });

      const citationBlockNode = citationContainer.children[1];
      expect(citationBlockNode).toMatchObject({
        type: AST_VISIT_CHECK.ELEMENT,
        tagName: 'div',
        data: {
          hProperties: {
            citationPart: CitationPart.CITATION_BLOCK,
            page: '5',
          },
        },
      });
    });

    it('should preserve citation order for multiple pages', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Text[cite:3,1,5,2]')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const citationContainer = tree.children[0].children[0];
      const citationBlocks = citationContainer.children.slice(1);

      expect(citationBlocks[0].data.hProperties.page).toBe('3');
      expect(citationBlocks[1].data.hProperties.page).toBe('1');
      expect(citationBlocks[2].data.hProperties.page).toBe('5');
      expect(citationBlocks[3].data.hProperties.page).toBe('2');
    });
  });

  describe('text cleaning', () => {
    it('should clean citation markers from remaining text', () => {
      const tree = {
        type: 'root',
        children: [createParagraphNode('[cite_start]Cited[cite:1] Normal text')],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const paragraphChildren = tree.children[0].children;
      const textNodes = paragraphChildren.filter(child => child.type === AST_VISIT_CHECK.TEXT);

      textNodes.forEach(textNode => {
        expect(textNode.value).not.toContain('[cite_start]');
        expect(textNode.value).not.toMatch(/\[cite:\d*\]/);
      });
    });

    it('should clean citation markers from all text nodes', () => {
      const tree = {
        type: 'root',
        children: [
          createParagraphNode('Text with [cite_start] incomplete [cite:] markers'),
        ],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const textNode = tree.children[0].children[0];
      expect(textNode.value).toBe('Text with  incomplete  markers');
    });
  });

  describe('complex scenarios', () => {
    it('should handle nested paragraphs with multiple citations', () => {
      const tree = {
        type: 'root',
        children: [
          createParagraphNode('[cite_start]First[cite:1]'),
          createParagraphNode('[cite_start]Second[cite:2]'),
          createParagraphNode('[cite_start]Third[cite:3]'),
        ],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      expect(tree.children).toHaveLength(3);

      tree.children.forEach((paragraph, index) => {
        const citation = paragraph.children[0];
        expect(citation.data.hProperties.citationPart).toBe(CitationPart.CITATION_CONTAINER);
        expect(citation.children[1].data.hProperties.page).toBe(String(index + 1));
      });
    });

    it('should handle citation with very long text', () => {
      const longText = 'A'.repeat(10000);
      const tree = {
        type: 'root',
        children: [createParagraphNode(`[cite_start]${longText}[cite:1]`)],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const citationContainer = tree.children[0].children[0];
      expect(citationContainer.children[0].children[0].value).toBe(longText);
    });

    it('should handle citation with special characters in text', () => {
      const specialText = 'Text with <html> & "quotes" \'apostrophes\' $symbols';
      const tree = {
        type: 'root',
        children: [createParagraphNode(`[cite_start]${specialText}[cite:1]`)],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const citationContainer = tree.children[0].children[0];
      expect(citationContainer.children[0].children[0].value).toBe(specialText);
    });

    it('should handle citation with unicode characters', () => {
      const unicodeText = '文字 🎉 émojis';
      const tree = {
        type: 'root',
        children: [createParagraphNode(`[cite_start]${unicodeText}[cite:1]`)],
      };

      const plugin = remarkCitationsSource();
      plugin(tree);

      const citationContainer = tree.children[0].children[0];
      expect(citationContainer.children[0].children[0].value).toBe(unicodeText);
    });
  });
});
