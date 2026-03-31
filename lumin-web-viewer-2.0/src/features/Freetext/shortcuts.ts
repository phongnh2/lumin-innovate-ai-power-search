import Quill, { Range } from 'quill';

const formatHandler = (format: string) => function handler(this: { quill: Quill }, _range: Range, context: { prefix: string; suffix: string }) {
    const self = this as unknown as { quill: Quill };
    if (context.prefix === '' && context.suffix === '') {
      const shouldApplied = !self.quill.getFormat(0, self.quill.getLength())[format];
      self.quill.format(format, shouldApplied);
    }
  };

export const shortcutsMap = {
  bold: {
    key: 'b',
    shortKey: true,
    handler: formatHandler('bold'),
  },
  italic: {
    key: 'i',
    shortKey: true,
    handler: formatHandler('italic'),
  },
  underline: {
    key: 'u',
    shortKey: true,
    handler: formatHandler('underline'),
  },
  strike: {
    key: 'k',
    shortKey: true,
    handler: formatHandler('strike'),
  },
};
