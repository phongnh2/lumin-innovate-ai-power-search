import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockReturnValue({ _id: 'user-123', name: 'Test User' }),
  shallowEqual: jest.fn(),
}));

jest.mock('selectors', () => ({ getCurrentUser: jest.fn() }));

jest.mock('hooks', () => ({
  useAvailablePersonalWorkspace: () => true,
  useFuseSearch: () => ({ searchText: '', onChange: jest.fn(), results: [] }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('helpers/logger', () => ({ logError: jest.fn() }));

jest.mock('constants/documentConstants', () => ({
  folderType: { INDIVIDUAL: 'individual', ORGANIZATION: 'organization' },
  DOCUMENT_TYPE: { PERSONAL: 'PERSONAL', FOLDER: 'FOLDER', ORGANIZATION: 'ORGANIZATION' },
}));

jest.mock('constants/lumin-common', () => ({ STORAGE_TYPE: { SYSTEM: 'SYSTEM' } }));
jest.mock('constants/organizationConstants', () => ({ ORGANIZATION_TEXT: 'Organization' }));

jest.mock('../TransferDocumentUtility/utility', () => ({
  __esModule: true,
  default: {
    from: () => ({
      getAllExpandedList: jest.fn().mockResolvedValue([]),
      getBreadcrumb: jest.fn().mockReturnValue([]),
      getSuccessMessage: jest.fn(),
      getInfoOf: jest.fn(),
    }),
    reset: jest.fn(),
  },
}));

import { useDestination } from 'luminComponents/TransferDocument/hooks/useDestination';

describe('useDestination', () => {
  const mockDocument = {
    clientId: 'doc-123',
    folderId: null,
    isPersonal: true,
    isShared: false,
    service: 's3',
    documentType: 'PERSONAL',
  };

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useDestination({ document: mockDocument }));
    expect(result.current.loading).toBe(true);
  });

  it('should return initial source', () => {
    const { result } = renderHook(() => useDestination({ document: mockDocument }));
    expect(result.current.initialSource).toBeDefined();
  });

  it('should return search object', () => {
    const { result } = renderHook(() => useDestination({ document: mockDocument }));
    expect(result.current.search).toBeDefined();
    expect(result.current.search.text).toBe('');
    expect(result.current.search.onChange).toBeDefined();
  });

  it('should return breadcrumb', () => {
    const { result } = renderHook(() => useDestination({ document: mockDocument }));
    expect(result.current.breadcrumb).toBeDefined();
  });

  it('should return expandedList', () => {
    const { result } = renderHook(() => useDestination({ document: mockDocument }));
    expect(result.current.expandedList).toBeDefined();
  });

  it('should return changeToNewSource function', () => {
    const { result } = renderHook(() => useDestination({ document: mockDocument }));
    expect(typeof result.current.changeToNewSource).toBe('function');
  });

  it('should return navigateTo function', () => {
    const { result } = renderHook(() => useDestination({ document: mockDocument }));
    expect(typeof result.current.navigateTo).toBe('function');
  });
});

