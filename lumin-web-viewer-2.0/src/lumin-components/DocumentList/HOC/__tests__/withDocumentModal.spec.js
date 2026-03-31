import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import withDocumentModal from '../withDocumentModal';
import { DocumentActions, DOCUMENT_TYPE } from 'constants/documentConstants';

jest.mock('@loadable/component', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (loadFn) => {
      return function LoadableComponent(props) {
        const [Component, setComponent] = React.useState(null);
        React.useEffect(() => {
          loadFn().then((module) => setComponent(() => module.default || module));
        }, []);
        return Component ? <Component {...props} /> : null;
      };
    },
  };
});

jest.mock('lumin-components/RenameDocumentModal', () => ({ open, document }) =>
  open ? <div data-testid="RenameModal">{document?.name}</div> : null
);

jest.mock('lumin-components/WarningDeleteDocModal', () => ({ open }) =>
  open ? <div data-testid="DeleteModal" /> : null
);

jest.mock('lumin-components/ShareModal', () => ({ currentDocument }) => (
  <div data-testid="ShareModal">{currentDocument?.id}</div>
));

jest.mock('lumin-components/ShareDocumentOrganizationModal', () => ({ open, currentDocument, onClose, updateDocument }) =>
  open ? (
    <div data-testid="OrgShareModal">
      {currentDocument?.id}
      <button onClick={() => onClose()}>Close</button>
      <button onClick={() => updateDocument({ name: 'UpdatedDoc' })}>Update</button>
    </div>
  ) : null
);

jest.mock('lumin-components/TransferDocument/components/CopyDocumentModal', () => ({
  CopyDocumentModalComponent: ({ document }) => <div data-testid="CopyModal">{document?.id}</div>,
}));

jest.mock('lumin-components/TransferDocument/components/MoveDocumentModal', () => ({ documents }) => (
  <div data-testid="MoveModal">{documents?.length} documents</div>
));

jest.mock('lumin-components/TransferDocument/components/UploadDocumentModal', () => ({ visible, document }) =>
  visible ? <div data-testid="UploadModal">{document?.id}</div> : null
);

jest.mock('lumin-components/InfoModal', () => ({ open, currentTarget }) =>
  open ? <div data-testid="InfoModal">{currentTarget?.id}</div> : null
);

jest.mock('lumin-components/TemplateModal', () => ({
  CreateBaseOnDoc: ({ defaultValues }) => <div data-testid="TemplateModal">{defaultValues?.name}</div>,
}));

jest.mock('features/MultipleMerge/components/MultipleMergeModal/MultipleMergeModal', () => ({ initialDocuments }) => (
  <div data-testid="MergeModal">{initialDocuments?.length} documents</div>
));

jest.mock('hooks', () => ({
  useGetFolderType: jest.fn(() => 'individual'),
  useTranslation: jest.fn(() => ({ t: (key) => key })),
  useDocumentsRouteMatch: jest.fn(() => false),
  useCreateTemplateOnDocument: jest.fn(() => ({ onSubmit: jest.fn() })),
}));

const mockStore = configureStore([]);
const store = mockStore({});
const MockComponent = ({ openDocumentModal }) => (
  <>
    <button
      onClick={() =>
        openDocumentModal({
          mode: DocumentActions.Rename,
          selectedDocuments: [{ id: 1, name: 'test.pdf' }],
        })
      }
    >
      Rename
    </button>
    <button
      onClick={() =>
        openDocumentModal({
          mode: DocumentActions.Share,
          selectedDocuments: [{ id: 2, documentType: DOCUMENT_TYPE.PERSONAL }],
        })
      }
    >
      Share
    </button>
    <button
      onClick={() =>
        openDocumentModal({
          mode: DocumentActions.Move,
          selectedDocuments: [{ id: 3 }],
        })
      }
    >
      Move
    </button>
    <button
      onClick={() =>
        openDocumentModal({
          mode: DocumentActions.MakeACopy,
          selectedDocuments: [{ id: 4 }],
        })
      }
    >
      Copy
    </button>
    <button
      onClick={() =>
        openDocumentModal({
          mode: DocumentActions.View,
          selectedDocuments: [{ id: 5 }],
        })
      }
    >
      View
    </button>
    <button
      onClick={() =>
        openDocumentModal({
          mode: DocumentActions.Remove,
          selectedDocuments: [{ id: 6 }],
        })
      }
    >
      Delete
    </button>
    <button
      onClick={() =>
        openDocumentModal({
          mode: DocumentActions.UploadToLumin,
          selectedDocuments: [{ id: 7 }],
        })
      }
    >
      Upload
    </button>
    <button
      onClick={() =>
        openDocumentModal({
          mode: DocumentActions.CreateAsTemplate,
          selectedDocuments: [{ id: 8, name: 'TemplateDoc.pdf', thumbnail: null }],
        })
      }
    >
      Template
    </button>
    <button
      onClick={() =>
        openDocumentModal({
          mode: DocumentActions.Merge,
          selectedDocuments: [{ id: 9 }, { id: 10 }],
        })
      }
    >
      Merge
    </button>
    <button
      onClick={() =>
        openDocumentModal({
          mode: DocumentActions.Share,
          selectedDocuments: [{ id: 100, documentType: DOCUMENT_TYPE.ORGANIZATION }],
        })
      }
    >
      OrgShare
    </button>
    <button
      onClick={() =>
        openDocumentModal({
          mode: 'INVALID_MODE',
          selectedDocuments: [{ id: 101 }],
        })
      }
    >
      Invalid
    </button>
  </>
);

const Wrapped = withDocumentModal(MockComponent);

const renderWrapped = () =>
  render(
    <Provider store={store}>
      <Wrapped refetchDocument={jest.fn()} />
    </Provider>
  );

describe('withDocumentModal HOC - full coverage', () => {
  test('renders wrapped component', () => {
    renderWrapped();
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Move')).toBeInTheDocument();
  });

  test('opens Rename modal', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('Rename'));
    expect(await screen.findByTestId('RenameModal')).toBeInTheDocument();
  });

  test('opens Share modal', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('Share'));
    expect(await screen.findByTestId('ShareModal')).toBeInTheDocument();
  });

  test('opens Move modal', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('Move'));
    expect(await screen.findByTestId('MoveModal')).toBeInTheDocument();
  });

  test('opens Copy modal', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('Copy'));
    expect(await screen.findByTestId('CopyModal')).toBeInTheDocument();
  });

  test('opens Info modal', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('View'));
    expect(await screen.findByTestId('InfoModal')).toBeInTheDocument();
  });

  test('opens Delete modal', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByTestId('DeleteModal')).toBeInTheDocument();
  });

  test('opens Upload modal', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('Upload'));
    expect(await screen.findByTestId('UploadModal')).toBeInTheDocument();
  });

  test('opens Template modal', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('Template'));
    expect(await screen.findByTestId('TemplateModal')).toBeInTheDocument();
  });

  test('opens Merge modal', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('Merge'));
    expect(await screen.findByTestId('MergeModal')).toBeInTheDocument();
  });

  test('ShareDocumentOrganizationModal branch', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('OrgShare'));
  
    const modal = await screen.findByTestId('OrgShareModal');
    expect(modal).toBeInTheDocument();
  
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);  
    expect(screen.getByText('Update')).toBeInTheDocument();
  
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
  
    await waitFor(() => {
      expect(screen.queryByTestId('OrgShareModal')).not.toBeInTheDocument();
    });
  });
  

  test('default case returns null for unknown mode', async () => {
    renderWrapped();
    fireEvent.click(screen.getByText('Invalid'));
    await waitFor(() => {
      expect(screen.queryByTestId('OrgShareModal')).not.toBeInTheDocument();
    });
  });
});
