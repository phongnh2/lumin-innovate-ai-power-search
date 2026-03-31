import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useGetFolderType } from 'hooks';

import { DocFolderMapping } from 'constants/folderConstant';

import { useFolderDocuments, useGetFolderDetail, useUpdateFolderInfo } from './hooks';

const withFetchingFolder = (Component) => {
  function HOC() {
    const dispatch = useDispatch();

    const { isFocusing, searchKey } = useSelector(selectors.getPageSearchData);

    const currentFolderType = useGetFolderType();
    const documentFolderType = DocFolderMapping[currentFolderType];
    const { error, loading: folderLoading, folderDetail: folder, update } = useGetFolderDetail(documentFolderType);
    const folderDocumentsData = useFolderDocuments({ searchKey, isFocusing });
    useUpdateFolderInfo(folder, update);

    const setSearchKey = (value) => dispatch(actions.setSearchKeyPageSearch(value));

    const setFocusing = (value) => dispatch(actions.setFocusingPageSearch(value));

    return (
      <Component
        searchKey={searchKey}
        setSearchKey={setSearchKey}
        isFocusing={isFocusing}
        setFocusing={setFocusing}
        folderLoading={folderLoading}
        error={error}
        currentFolderType={currentFolderType}
        folderDocumentProps={folderDocumentsData}
        folder={folder}
      />
    );
  }
  return HOC;
};

export default withFetchingFolder;
