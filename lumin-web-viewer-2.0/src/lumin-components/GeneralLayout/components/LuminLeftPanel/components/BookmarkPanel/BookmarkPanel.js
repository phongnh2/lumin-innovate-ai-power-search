// eslint-disable-next-line import/no-unresolved
import { ArrowSquareOutIcon } from '@luminpdf/icons/dist/csr/ArrowSquareOut';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';

import selectors from 'selectors';

import PanelHeader from 'lumin-components/GeneralLayout/components/LuminLeftPanel/components/PanelHeader';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import Bookmark from './Bookmark';

import * as Styled from './BookmarkPanel.styled';

import styles from './BookmarkPanel.module.scss';

const sortByPageNumber = (a, b) => a.getPageNumber() - b.getPageNumber();

const LearnMoreLink = (props) => {
  const { children, ...otherProps } = props;
  return (
    <a
      href="https://help.luminpdf.com/how-do-i-bookmark-a-page-in-my-document"
      target="_blank"
      rel="noreferrer"
      {...otherProps}
    >
      {children}
      <ArrowSquareOutIcon weight="bold" size={14} />
    </a>
  );
};

LearnMoreLink.propTypes = {
  children: PropTypes.node.isRequired,
};

const BookmarkPanel = () => {
  const { t } = useTranslation();
  const bookmarks = useShallowSelector(selectors.getBookmarks);
  const sortedBookmarks = useMemo(() => bookmarks.sort(sortByPageNumber), [bookmarks]);

  return (
    <Styled.BookmarkPanel>
      <PanelHeader title={t('viewer.viewerLeftPanel.bookmarks')} />

      <Styled.InfoWrapper>
        <p className={styles.info}>
          <Trans
            i18nKey="outlines.replaceBookmarks"
            components={{
              Link: <LearnMoreLink />,
            }}
          />
        </p>
      </Styled.InfoWrapper>
      <Styled.BookmarkList className="custom-scrollbar-reskin">
        {sortedBookmarks.map((bookmark, i) => (
          <Bookmark bookmark={bookmark} key={i} />
        ))}
      </Styled.BookmarkList>
    </Styled.BookmarkPanel>
  );
};

export default BookmarkPanel;
