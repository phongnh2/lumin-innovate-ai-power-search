import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import EmptyImg from 'assets/images/empty-document-list.svg';
import NoSharedDocumentImg from 'assets/images/no-shared-document.svg';
import NoDocumentImg from 'assets/lumin-svgs/no-document.svg';

import { DocumentSearchContext } from 'lumin-components/Document/context';
import EmptySearchResult from 'lumin-components/DocumentComponents/components/EmptySearchResult';

import { useTranslation } from 'hooks';

import isMobileOrTablet from 'helpers/isMobileOrTablet';

import {
  folderType,
} from 'constants/documentConstants';

import * as Styled from './EmptyDocumentList.styled';

function EmptyDocumentList({ currentFolderType, isEmptyList }) {
  const { t } = useTranslation();
  const { isSearchView, folderLoading } = useContext(DocumentSearchContext);
  const getEmptyDocumentAttributes = () => {
    switch (currentFolderType) {
      case folderType.SHARED:
        return {
          src: NoSharedDocumentImg,
          content: <Styled.NoDocumentText>{t('documentPage.messageNoSharedDocument')}</Styled.NoDocumentText>,
        };
      case folderType.STARRED:
        return {
          src: NoSharedDocumentImg,
          content: <Styled.NoDocumentText>{t('documentPage.messageNoStarredDocument')}</Styled.NoDocumentText>,
        };
      default:
        break;
    }

    if (!isEmptyList) {
      return {
        src: NoDocumentImg,
        content: <Styled.NoDocumentText>{t('documentPage.messageNoDocument')}</Styled.NoDocumentText>,
      };
    }

    return {
      isDragDropMode: true,
      src: EmptyImg,
      content: (!isMobileOrTablet()) ? (
        <>
          <Styled.MainText>{t('documentPage.dragDropMode.mainText1')}</Styled.MainText>
          <Styled.SubText>{t('documentPage.dragDropMode.subText1')}</Styled.SubText>
        </>
      ) : (
        <>
          <Styled.MainText>{t('documentPage.dragDropMode.mainText2')}</Styled.MainText>
          <Styled.SubText>{t('documentPage.dragDropMode.subText2')}</Styled.SubText>
        </>
      ),
    };
  };

  const { src, content, isDragDropMode = false } = getEmptyDocumentAttributes();

  if (!isDragDropMode) {
    return (
      <Styled.NoDocumentContainer>
        <Styled.NoDocumentImg src={src} alt="empty document list" draggable={false} />
        {content}
      </Styled.NoDocumentContainer>
    );
  }

  return (
    (isSearchView && !folderLoading) ? <EmptySearchResult /> :
    <Styled.Wrapper id="document-list-root">
      <Styled.Circle>
        <Styled.DragDropImg src={src} alt="empty document list" draggable={false} />
        {content}
      </Styled.Circle>
    </Styled.Wrapper>
  );
}

EmptyDocumentList.propTypes = {
  currentFolderType: PropTypes.oneOf(Object.values(folderType)),
  isEmptyList: PropTypes.bool,
};

EmptyDocumentList.defaultProps = {
  currentFolderType: folderType.INDIVIDUAL,
  isEmptyList: false,
};

export default EmptyDocumentList;
