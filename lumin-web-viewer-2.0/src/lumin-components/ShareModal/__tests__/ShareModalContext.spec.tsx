import React from 'react';
import { ShareModalContext } from '../ShareModalContext';

describe('ShareModalContext', () => {
  it('should be a valid React Context', () => {
    expect(ShareModalContext).toBeDefined();
    expect(ShareModalContext.Provider).toBeDefined();
    expect(ShareModalContext.Consumer).toBeDefined();
  });

  it('should have undefined as default value', () => {
    // React.createContext() without argument returns undefined as default
    expect(ShareModalContext._currentValue).toBeUndefined();
  });
});

