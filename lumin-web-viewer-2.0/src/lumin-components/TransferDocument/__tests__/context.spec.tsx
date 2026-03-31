import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TransferDocumentContext } from '../context';

describe('TransferDocumentContext', () => {
  it('should be defined', () => {
    expect(TransferDocumentContext).toBeDefined();
  });

  it('should be a React context', () => {
    expect(TransferDocumentContext.Provider).toBeDefined();
    expect(TransferDocumentContext.Consumer).toBeDefined();
  });

  it('should have null as default value', () => {
    const TestComponent = () => {
      const value = React.useContext(TransferDocumentContext);
      return <div data-testid="context-value">{value === null ? 'null' : 'not-null'}</div>;
    };
    
    const { container } = render(<TestComponent />);
    expect(container.querySelector('[data-testid="context-value"]')).toHaveTextContent('null');
  });

  it('should provide value to consumers', () => {
    const mockValue = {
      getter: { selectedTarget: { _id: 'test' } },
      setter: { onClose: jest.fn() },
      onSubmit: jest.fn(),
    };

    const TestComponent = () => {
      const value = React.useContext(TransferDocumentContext);
      return <div data-testid="context-value">{value?.getter?.selectedTarget?._id || 'no-value'}</div>;
    };

    const { container } = render(
      <TransferDocumentContext.Provider value={mockValue as any}>
        <TestComponent />
      </TransferDocumentContext.Provider>
    );
    expect(container.querySelector('[data-testid="context-value"]')).toHaveTextContent('test');
  });
});
