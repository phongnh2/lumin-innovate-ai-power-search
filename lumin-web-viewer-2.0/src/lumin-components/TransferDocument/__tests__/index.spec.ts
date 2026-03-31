import '@testing-library/jest-dom';

jest.mock('utils/lazyWithRetry', () => ({
  lazyWithRetry: jest.fn(() => {
    const React = require('react');
    return () => React.createElement('div', { 'data-testid': 'transfer-document' }, 'TransferDocument');
  }),
}));

jest.mock('luminComponents/TransferDocument/TransferDocumentContainer', () => ({
  __esModule: true,
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'transfer-document-container' }, 'Container');
  },
}));

describe('TransferDocument index', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should export TransferDocument as default', () => {
    const TransferDocument = require('luminComponents/TransferDocument/index').default;
    expect(TransferDocument).toBeDefined();
  });

  it('should export is a function/component', () => {
    const TransferDocument = require('luminComponents/TransferDocument/index').default;
    expect(typeof TransferDocument).toBe('function');
  });
});
