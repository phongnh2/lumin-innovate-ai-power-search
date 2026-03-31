import React from 'react';
import { render } from '@testing-library/react';
import withCurrentDocuments from '../withCurrentDocuments';
import { useSelector } from 'react-redux';
import { useFolderPathMatch, useGetCurrentTeam, useGetFolderType } from 'hooks';
import { documentServices } from 'services';
import { folderType } from 'constants/documentConstants';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('hooks', () => ({
  useFolderPathMatch: jest.fn(),
  useGetCurrentTeam: jest.fn(),
  useGetFolderType: jest.fn(),
}));

jest.mock('services', () => ({
  documentServices: {
    getCurrentDocumentList: jest.fn(),
  },
}));

const Dummy = ({ documents }) => <div data-testid="docs">{documents.length}</div>;

const Wrapped = withCurrentDocuments(Dummy);

describe('withCurrentDocuments HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation((fn) => {
      if (fn.name === 'getCurrentOrganization') return { data: { _id: 'org1' } };
      if (fn.name === 'isOffline') return false;
      return {};
    });

    useGetCurrentTeam.mockReturnValue({ _id: 'team1' });
  });

  test('returns props.documents when isInFolderPage = true', () => {
    useFolderPathMatch.mockReturnValue(true);
    useGetFolderType.mockReturnValue(folderType.DOCUMENT);

    const { getByTestId } = render(<Wrapped documents={[{ id: 1 }]} />);

    expect(getByTestId('docs').textContent).toBe('1');
    expect(documentServices.getCurrentDocumentList).not.toHaveBeenCalled();
  });

  test('returns props.documents when isOffline = true', () => {
    useFolderPathMatch.mockReturnValue(false);
    useGetFolderType.mockReturnValue(folderType.DOCUMENT);

    useSelector.mockImplementation((fn) => {
      if (fn.name === 'isOffline') return true;
      if (fn.name === 'getCurrentOrganization') return { data: { _id: 'org1' } };
      return {};
    });

    const { getByTestId } = render(<Wrapped documents={[{ id: 2 }]} />);

    expect(getByTestId('docs').textContent).toBe('1');
    expect(documentServices.getCurrentDocumentList).not.toHaveBeenCalled();
  });

  test('returns documentServices.getCurrentDocumentList when not in folder/offline', () => {
    useFolderPathMatch.mockReturnValue(false);
    useGetFolderType.mockReturnValue(folderType.DOCUMENT);

    documentServices.getCurrentDocumentList.mockReturnValue({
      documents: [{ id: 99 }],
    });

    const { getByTestId } = render(<Wrapped documents={[]} />);

    expect(documentServices.getCurrentDocumentList).toHaveBeenCalledWith(folderType.DOCUMENT, {
      teamId: 'team1',
      orgId: 'org1',
    });

    expect(getByTestId('docs').textContent).toBe('1');
  });

  test('falls back to empty object when organization.data is undefined', () => {
    useFolderPathMatch.mockReturnValue(false);
    useGetFolderType.mockReturnValue(folderType.DOCUMENT);

    useSelector.mockImplementation((fn) => {
      if (fn.name === 'getCurrentOrganization') return {};
      if (fn.name === 'isOffline') return false;
      return {};
    });

    useGetCurrentTeam.mockReturnValue({ _id: 'team1' });

    documentServices.getCurrentDocumentList.mockReturnValue({
      documents: [{ id: 123 }],
    });

    const { getByTestId } = render(<Wrapped documents={[]} />);

    expect(documentServices.getCurrentDocumentList).toHaveBeenCalledWith(folderType.DOCUMENT, {
      teamId: 'team1',
      orgId: undefined,
    });

    expect(getByTestId('docs').textContent).toBe('1');
  });
});
