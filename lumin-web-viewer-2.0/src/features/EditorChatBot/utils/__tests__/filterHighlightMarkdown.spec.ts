import { filterHighlightMarkdown } from '../filterHighlightMarkdown';

describe('filterHighlightMarkdown', () => {
  it('should filter highlight markdown', () => {
    const message = 'Lorem ipsum dolor sit amet, <mark><span contenteditable=\'false\'>[text]</span></mark> consectetur adipiscing elit.';
    const result = filterHighlightMarkdown(message);
    expect(result).toBe('Lorem ipsum dolor sit amet, text consectetur adipiscing elit.');
  });
});