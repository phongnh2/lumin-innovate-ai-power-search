import React from 'react';
import PropTypes from 'prop-types';

import SearchDocImg from 'assets/lumin-svgs/default-search-doc.svg';
import { useTranslation } from 'hooks';

import { DEFAULT_SEARCH_VIEW_TYPE } from './types';
import * as Styled from './DefaultSearchView.styled';

const getDefaultSearchViewData = (t) => ({
  DOCUMENT: {
    title: t('searchDocument.document.title'),
    content: t('searchDocument.document.content'),
  },
  DOCUMENT_FOLDER: {
    title: t('searchDocument.documentFolder.title'),
    content: t('searchDocument.documentFolder.content'),
  },
  TEMPLATE: {
    title: t('searchDocument.template.title'),
    content: t('searchDocument.template.content'),
  },
  DEVICE: {
    title: t('searchDocument.device.title'),
    content: t('searchDocument.device.content'),
  },
});

function DefaultSearchView({ type }) {
  const { t } = useTranslation();
  const data = getDefaultSearchViewData(t)[type];
  const { title, content } = data;
  return (
    <Styled.Container $isFolder={type === DEFAULT_SEARCH_VIEW_TYPE.DOCUMENT_FOLDER}>
      <Styled.Image src={SearchDocImg} alt={title} />
      <Styled.Title>{title}</Styled.Title>
      <Styled.Content>{content}</Styled.Content>
    </Styled.Container>
  );
}

DefaultSearchView.propTypes = {
  type: PropTypes.oneOf(Object.values(DEFAULT_SEARCH_VIEW_TYPE)),
};

DefaultSearchView.defaultProps = {
  type: DEFAULT_SEARCH_VIEW_TYPE.DOCUMENT,
};

export default DefaultSearchView;
