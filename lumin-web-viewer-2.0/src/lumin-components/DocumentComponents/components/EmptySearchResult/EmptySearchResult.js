import React from 'react';
import PropTypes from 'prop-types';
import NoSearchResultImg from 'assets/lumin-svgs/no-document.svg';
import { useTranslation } from 'hooks';
import * as Styled from './EmptySearchResult.styled';

function EmptySearchResult({ noResultFolderOrDoc }) {
  const { t } = useTranslation();

  return (
    <Styled.Container isSmallTab={noResultFolderOrDoc} id="document-list-root">
      <Styled.Image isSmallTab={noResultFolderOrDoc} src={NoSearchResultImg} alt="Empty search result" />
      <Styled.Title isSmallTab={noResultFolderOrDoc}>{t('searchDocument.noResult')}</Styled.Title>
      <Styled.Content isSmallTab={noResultFolderOrDoc}>{t('searchDocument.tryAgain')}</Styled.Content>
    </Styled.Container>
  );
}

EmptySearchResult.propTypes = {
  noResultFolderOrDoc: PropTypes.bool,
};

EmptySearchResult.defaultProps = {
  noResultFolderOrDoc: false,
};

export default EmptySearchResult;
