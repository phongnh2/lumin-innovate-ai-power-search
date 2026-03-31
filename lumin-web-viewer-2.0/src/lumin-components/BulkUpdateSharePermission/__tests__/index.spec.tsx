import React from 'react';
import '@testing-library/jest-dom';

describe('BulkUpdateSharePermission index', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should export default from BulkUpdateSharePermission', () => {
    // Mock the BulkUpdateSharePermission module
    jest.mock('luminComponents/BulkUpdateSharePermission/BulkUpdateSharePermission', () => ({
      __esModule: true,
      default: () => <div>BulkUpdateSharePermission</div>,
    }));

    const BulkUpdateSharePermission = require('luminComponents/BulkUpdateSharePermission').default;
    expect(BulkUpdateSharePermission).toBeDefined();
  });

  it('should export a component', () => {
    jest.mock('luminComponents/BulkUpdateSharePermission/BulkUpdateSharePermission', () => ({
      __esModule: true,
      default: () => <div>BulkUpdateSharePermission</div>,
    }));

    const BulkUpdateSharePermission = require('luminComponents/BulkUpdateSharePermission').default;
    expect(typeof BulkUpdateSharePermission).toBe('function');
  });

  it('should be the same as BulkUpdateSharePermission default export', () => {
    const mockComponent = () => <div>Mock</div>;
    jest.mock('luminComponents/BulkUpdateSharePermission/BulkUpdateSharePermission', () => ({
      __esModule: true,
      default: mockComponent,
    }));

    const IndexExport = require('luminComponents/BulkUpdateSharePermission').default;
    const DirectExport = require('luminComponents/BulkUpdateSharePermission/BulkUpdateSharePermission').default;
    
    expect(IndexExport).toBe(DirectExport);
  });
});
