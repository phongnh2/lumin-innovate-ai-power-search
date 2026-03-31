import PropTypes from 'prop-types';
import React, { useEffect, useContext } from 'react';
import { connect, useSelector } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import { DocumentContext } from 'lumin-components/Document/context';
import { withCurrentDocuments } from 'lumin-components/DocumentList/HOC';
import { useTotalDocument } from 'lumin-components/DocumentListHeaderBar/hooks';
import HeaderBarSection from 'luminComponents/HeaderBarSection';
import { DocumentSelectionBar } from 'luminComponents/ReskinLayout/components/DocumentSelectionBar';

import { useEnableWebReskin, useFolderPathMatch, useGetFolderType } from 'hooks';

import { DOCUMENT_OFFLINE_STATUS, folderType } from 'constants/documentConstants';
import { CHECKBOX_TYPE } from 'constants/lumin-common';

import { withDocumentHeaderAction } from './HOC';

const propTypes = {
  documents: PropTypes.arrayOf(PropTypes.object),
  selectedDocList: PropTypes.array,
  selectedFolders: PropTypes.array,
  selectDocMode: PropTypes.bool.isRequired,
  setSelectDocMode: PropTypes.func.isRequired,
  setRemoveDocList: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  onMerge: PropTypes.func,
  onMove: PropTypes.func,
  setRemoveFolderList: PropTypes.func,
  folders: PropTypes.array,
};

const defaultProps = {
  documents: [],
  selectedDocList: [],
  selectedFolders: [],
  onRemove: () => {},
  onMerge: () => {},
  onMove: () => {},
  setRemoveFolderList: () => {},
  folders: [],
};

function DocumentListHeaderBar(props) {
  const {
    documents: currentDocuments,
    selectedDocList,
    selectedFolders,
    selectDocMode,
    setSelectDocMode,
    setRemoveDocList,
    onRemove,
    onMerge,
    onMove,
    setRemoveFolderList,
    folders: currentFolders,
  } = props;
  const isOffline = useSelector(selectors.isOffline);
  const { totalDocInFolder, isMoving, isDeleting } = useContext(DocumentContext);
  const currentFolderType = useGetFolderType();

  const isInFolderPage = useFolderPathMatch();
  const totalDocuments = useTotalDocument();

  const { isEnableReskin } = useEnableWebReskin();

  const totalSelectedDoc = selectedDocList.length;
  const totalSelectedFolder = selectedFolders.length;
  const totalSelected = totalSelectedDoc + totalSelectedFolder;

  const onSelectMode = Boolean(totalSelected) || selectDocMode;

  const isDeviceTab = currentFolderType === folderType.DEVICE;
  const getCachedDocuments = () =>
    isDeviceTab
      ? currentDocuments
      : currentDocuments.filter((item) => item.offlineStatus === DOCUMENT_OFFLINE_STATUS.AVAILABLE);

  const currentActiveDocuments = isOffline ? getCachedDocuments() : currentDocuments;
  const currentActiveDocumentLength = currentActiveDocuments.length;
  const currentTotalFolder = currentFolders.length;

  const isDisabled = !totalSelected || isDeleting || isMoving || (isOffline && !isDeviceTab);

  const onChangeCheckbox = (e) => {
    const dataset = e.target.dataset || {};
    const isSelected = e.target.checked;
    if (isSelected || dataset.indeterminate === 'true') {
      setRemoveDocList({ data: currentActiveDocuments, type: CHECKBOX_TYPE.ALL });
      if (isEnableReskin) {
        setRemoveFolderList({ data: currentFolders, type: CHECKBOX_TYPE.ALL });
      }
    } else {
      setRemoveDocList({ type: CHECKBOX_TYPE.DELETE });
      if (isEnableReskin) {
        setRemoveFolderList({ type: CHECKBOX_TYPE.DELETE });
      }
    }
  };

  const onCancelSelectMode = () => {
    setSelectDocMode(false);
    setRemoveDocList({ type: CHECKBOX_TYPE.DELETE });
    setRemoveFolderList({ type: CHECKBOX_TYPE.DELETE });
  };

  const retrieveTotalDocument = () => {
    if (isOffline) {
      return currentActiveDocumentLength;
    }
    return isInFolderPage ? totalDocInFolder : totalDocuments;
  };

  useEffect(() => {
    setSelectDocMode(Boolean(isEnableReskin ? totalSelected : totalSelectedDoc));
  }, [totalSelected]);

  return isEnableReskin ? (
    <DocumentSelectionBar
      isDisplay={Boolean(onSelectMode)}
      isChecked={totalSelected === currentActiveDocumentLength + currentTotalFolder}
      isDisabled={isDisabled}
      totalDoc={retrieveTotalDocument()}
      totalSelected={totalSelected}
      currentTotalDoc={currentActiveDocumentLength}
      setSelectDocMode={setSelectDocMode}
      onRemove={onRemove}
      onMove={onMove}
      onMerge={onMerge}
      onChangeCheckbox={onChangeCheckbox}
      onCancelSelectMode={onCancelSelectMode}
      currentTotalFolder={currentTotalFolder}
    />
  ) : (
    <HeaderBarSection
      isDisplay={Boolean(onSelectMode)}
      isChecked={totalSelectedDoc === currentActiveDocumentLength}
      isDisabled={isDisabled}
      totalDoc={retrieveTotalDocument()}
      totalSelectDoc={totalSelectedDoc}
      currentTotalDoc={currentActiveDocumentLength}
      setSelectDocMode={setSelectDocMode}
      onRemove={onRemove}
      onMove={onMove}
      onChangeCheckbox={onChangeCheckbox}
      onCancelSelectMode={onCancelSelectMode}
    />
  );
}

DocumentListHeaderBar.propTypes = propTypes;
DocumentListHeaderBar.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state),
  ownedFilterCondition: selectors.getCurrentOwnedFilter(state),
});

export default compose(
  connect(mapStateToProps),
  withDocumentHeaderAction,
  withCurrentDocuments,
  React.memo
)(DocumentListHeaderBar);
