import PropTypes from 'prop-types';
import React from 'react';

import { DefaultSearchView as DefaultSearchViewReskin } from '@web-new-ui/components/DefaultSearchView';
import { EmptySearchResult } from '@web-new-ui/components/EmptySearchResult';

import { DEFAULT_SEARCH_VIEW_TYPE } from 'lumin-components/DefaultSearchView';

import { ContainerReskin, StyledMainBodyContainerReskin } from '../../DocumentFolder.styled';
import FolderDocumentList from '../FolderDocumentList';

const MainBody = ({
  isEmptySearchResult,
  openDefaultSearchView,
  folder,
  folderDocumentsData,
  searchKey,
  folderList = [],
  folderLoading,
  documentLoading,
}) => {
  const shouldShowEmptyGraphic = isEmptySearchResult && !openDefaultSearchView;

  if (shouldShowEmptyGraphic) {
    return <EmptySearchResult />;
  }

  return (
    <>
      {openDefaultSearchView && <DefaultSearchViewReskin type={DEFAULT_SEARCH_VIEW_TYPE.DOCUMENT_FOLDER} />}
      <StyledMainBodyContainerReskin $show={!openDefaultSearchView}>
        <ContainerReskin>
          <ContainerReskin>
            <FolderDocumentList
              {...folderDocumentsData}
              folderList={folderList}
              searchKey={searchKey}
              folder={folder}
              folderLoading={folderLoading}
              documentLoading={documentLoading}
            />
          </ContainerReskin>
        </ContainerReskin>
      </StyledMainBodyContainerReskin>
    </>
  );
};

MainBody.propTypes = {
  isEmptySearchResult: PropTypes.bool.isRequired,
  openDefaultSearchView: PropTypes.bool.isRequired,
  folder: PropTypes.object,
  folderDocumentsData: PropTypes.object,
  searchKey: PropTypes.string,
  folderList: PropTypes.array,
  folderLoading: PropTypes.bool,
  documentLoading: PropTypes.bool,
};

MainBody.defaultProps = {
  folder: {},
  folderList: [],
  folderDocumentsData: {},
  searchKey: '',
  folderLoading: true,
  documentLoading: true,
};

export default React.memo(MainBody);
