import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import produce from 'immer';

import { useSearchSystemFile } from 'hooks';
import actions from 'actions';
import { systemFileHandler } from 'HOC/OfflineStorageHOC';
import Handler from 'HOC/OfflineStorageHOC/Handler/Handler';
import { DocumentQueryProxy } from 'lumin-components/DocumentQuery/DocumentQueryProxy';

import { folderType } from 'constants/documentConstants';

const SystemStorageHOC = (WrappedComponent) => {
  function HOC(props) {
    const { pushDocumentToSystemList, updateDocumentSystem, removeDocumentFromSystemList } = props;
    const [systemFileProps, setSystemFileProps] = useState({
      queryProps: {
        loading: true,
        documentList: [],
        hasNextPage: false,
        fetchMore: () => {},
        refetch: () => {},
        total: 0,
      },
    });
    const systemFilesRef = useRef([]);
    const getSystemFiles = async () => {
      const currentSystemFiles = await systemFileHandler.getAll();
      systemFilesRef.current = currentSystemFiles;
      setSystemFiles(currentSystemFiles);
      DocumentQueryProxy(folderType.DEVICE, {
        documents: currentSystemFiles,
        hasNextPage: false,
        cursor: '',
        total: currentSystemFiles.length,
      });
    };
    const setSystemFiles = (files, opt = {}) => {
      setSystemFileProps((prev) => ({
        ...prev,
        queryProps: {
          documentList: files,
          loading: false,
          hasNextPage: false,
          fetchMore: () => {},
          refetch: () => {},
          total: files.length,
          ...opt,
        },
      }));
    };
    const handleAddSystemFile = (systemFiles) => {
      setSystemFileProps((prev) => {
        const newDocuments = [...systemFiles, ...prev.queryProps.documentList];
        systemFilesRef.current = newDocuments;
        return {
          ...prev,
          queryProps: {
            ...prev.queryProps,
            documentList: newDocuments,
          },
        };
      });
      systemFiles.forEach((file) => pushDocumentToSystemList(file));
    };

    const handleDeleteSystemFile = (documentId) => {
      setSystemFileProps((prev) => {
        const newDocuments = prev.queryProps.documentList.filter((item) => item._id !== documentId);
        systemFilesRef.current = newDocuments;
        return {
          ...prev,
          queryProps: {
            ...prev.queryProps,
            documentList: newDocuments,
          },
        };
      });
      removeDocumentFromSystemList({ _id: documentId });
    };

    const handleStarSystemFile = (systemDocument) => {
      setSystemFileProps((prev) => produce(prev, (draft) => {
        const draftDocuments = draft.queryProps.documentList;
        const updatedDocumentIdx = draftDocuments.findIndex((_document) => _document._id === systemDocument._id);
        if (updatedDocumentIdx > -1) {
          draftDocuments[updatedDocumentIdx] = { ...draftDocuments[updatedDocumentIdx], ...systemDocument };
        }
      }));
      updateDocumentSystem(systemDocument);
    };

    const searchProps = useSearchSystemFile({
      setSystemDocuments: setSystemFiles,
      systemDocuments: systemFilesRef.current,
      getSystemDocuments: getSystemFiles,
    });
    useEffect(() => {
      getSystemFiles();
      systemFileHandler.addEventListener(Handler.EVENTS.INSERT_SYSTEM_FILE, handleAddSystemFile);

      systemFileHandler.addEventListener(Handler.EVENTS.DELETE_SYSTEM_FILE, handleDeleteSystemFile);

      systemFileHandler.addEventListener(Handler.EVENTS.CHANGE_STAR_SYSTEM_FILE, handleStarSystemFile);

      return () => {
        systemFileHandler.removeAllEventListener();
      };
    }, []);

    return (
      <WrappedComponent
        {...props}
        {...systemFileProps}
        {...searchProps}
      />
    );
  }

  HOC.propTypes = {
    searchKey: PropTypes.string,
    pushDocumentToSystemList: PropTypes.func.isRequired,
    updateDocumentSystem: PropTypes.func.isRequired,
    removeDocumentFromSystemList: PropTypes.func.isRequired,
  };
  HOC.defaultProps = {
    searchKey: undefined,
  };

  const mapDispatchToProps = (dispatch) => ({
    pushDocumentToSystemList: (document) => dispatch(actions.pushDocumentToSystemList(document)),
    updateDocumentSystem: (document) => dispatch(actions.updateDocumentSystem(document)),
    removeDocumentFromSystemList: (document) => dispatch(actions.removeDocumentFromSystemList(document)),
  });

  return connect(null, mapDispatchToProps)(HOC);
};

export default SystemStorageHOC;
