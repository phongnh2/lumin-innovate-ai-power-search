import PropTypes from 'prop-types';
import React from 'react';

import core from 'core';

import { useTranslation } from 'hooks/useTranslation';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { TOOLS_NAME } from 'constants/toolsName';

import * as Styled from './BookmarkPanel.styled';

const Bookmark = ({ bookmark }) => {
  const { t } = useTranslation();

  const onClickBookmark = (_bookmark) => {
    if (!_bookmark.getHorizontalPosition() && !_bookmark.getVerticalPosition()) {
      core.setCurrentPage(_bookmark.getPageNumber());
    } else {
      core.gotoOutline(_bookmark);
    }
  };

  return (
    <Styled.BookmarkItem
      onClick={handlePromptCallback({
        callback: () => onClickBookmark(bookmark),
        applyForTool: TOOLS_NAME.REDACTION,
        translator: t,
      })}
    >
      <Styled.BookmarkTitle>{t('viewer.pageText', { text: bookmark.getPageNumber() })}</Styled.BookmarkTitle>
      <Styled.BookmarkContent>{bookmark.name}</Styled.BookmarkContent>
    </Styled.BookmarkItem>
  );
};

Bookmark.propTypes = {
  bookmark: PropTypes.object.isRequired,
};

export default Bookmark;
