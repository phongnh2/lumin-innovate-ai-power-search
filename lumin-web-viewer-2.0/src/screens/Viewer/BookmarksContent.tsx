import React from 'react';
import { useSelector } from 'react-redux';
import 'helpers/i18n';

import PlainTooltip from '@new-ui/general-components/Tooltip/PlainTooltip';

import selectors from 'selectors';

import { setDayJsLocale } from 'helpers/setDayJsLocale';

setDayJsLocale();

interface IBookmarkContentProps {
  children: React.ReactElement;
  content: string;
}

const BookmarkContent = ({ children, content }: IBookmarkContentProps) => {
  const isPageEditMode = useSelector(selectors.isPageEditMode);

  if (isPageEditMode) {
    return null;
  }
  return <PlainTooltip title={content || ''}>{children}</PlainTooltip>;
};

export default BookmarkContent;
