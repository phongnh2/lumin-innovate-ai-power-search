import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { compose } from 'redux';

import TopPopup from 'lumin-components/TopPopup';

import withUploadContainer from 'HOC/withUploadContainer';
import withUploadHandler from 'HOC/withUploadHandler';

import withUploadTemplatesContainer from 'features/UploadTemplate/HOC/withUploadTemplatesContainer';

export const DropDocumentPopupContext = React.createContext({
  setName: () => {},
  setFolder: () => {},
  folderDraggingOver: null,
  setNameFolders: () => {},
  nameFolders: {},
  name: '',
});

export const withDropDocPopupProvider = (Component) => {
  const DropDocPopupProvider = (props) => {
    const [name, setName] = useState(null);
    // folderDraggingOver is the folder that the user is currently dragging over to upload document(s) to
    const [folderDraggingOver, setFolderDraggingOver] = useState(null);
    const [nameFolders, setNameFolders] = useState({});
    const [isDropOnFolder, setDropOnFolder] = useState(false);
    const [folder, setFolder] = useState({});
    const contextValue = useMemo(
      () => ({
        name,
        setName,
        folderDraggingOver,
        setFolderDraggingOver,
        nameFolders,
        setNameFolders,
        setDropOnFolder,
        isDropOnFolder,
        folder,
        setFolder,
        onUpload: props.onUpload,
        canUpload: props.canUpload,
      }),
      [
        name,
        setName,
        folderDraggingOver,
        setFolderDraggingOver,
        nameFolders,
        setNameFolders,
        isDropOnFolder,
        setDropOnFolder,
        folder,
        setFolder,
        props.onUpload,
        props.canUpload,
      ]
    );

    const destinationName = useMemo(() => folderDraggingOver?.name || name, [name, folderDraggingOver]);

    return (
      <DropDocumentPopupContext.Provider value={contextValue}>
        <Component {...props} />
        <TopPopup.DropDocument name={destinationName} />
      </DropDocumentPopupContext.Provider>
    );
  };

  DropDocPopupProvider.propTypes = {
    onUpload: PropTypes.func.isRequired,
    canUpload: PropTypes.bool.isRequired,
  };

  return DropDocPopupProvider;
};

const withDropDocumentPopup = (Component) =>
  compose(withUploadContainer, withUploadHandler, withDropDocPopupProvider)(Component);

export const withUploadTemplatesProvider = (Component) =>
  compose(withUploadTemplatesContainer, withUploadHandler, withDropDocPopupProvider)(Component);

export default withDropDocumentPopup;
