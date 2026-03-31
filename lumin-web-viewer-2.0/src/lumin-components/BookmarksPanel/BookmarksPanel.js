import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import core from 'core';
import Bookmark from 'luminComponents/Bookmark';
import SvgElement from 'luminComponents/SvgElement';
import ViewerContext from '../../screens/Viewer/Context';
import './BookmarksPanel.scss';

const propTypes = {
  bookmarks: PropTypes.arrayOf(PropTypes.object),
  display: PropTypes.string.isRequired,
  setBookmarks: PropTypes.func,
  isDisabled: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

const defaultProps = {
  bookmarks: [],
  setBookmarks: () => {},
  isDisabled: false,
};

const sortByPageNumber = ((a, b) => a.getPageNumber() - b.getPageNumber());

const BookmarksPanel = ({
  t, display, bookmarks, setBookmarks, isDisabled,
}) => {
  const { bookmarkIns } = useContext(ViewerContext);
  const [activeBookmark, setActiveBookmark] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line no-use-before-define
    core.docViewer.addEventListener('native_manipUpdated', onManipUpdated);
    return () => {
      // eslint-disable-next-line no-use-before-define
      core.docViewer.removeEventListener('native_manipUpdated', onManipUpdated);
    };
  }, []);

  const onManipUpdated = () => {
    const optimisticBookmarks = [];
    bookmarkIns?.bookmarksUser && Object.keys(bookmarkIns.bookmarksUser).forEach((bookmark) => {
      const optimisticBookmark = new core.CoreControls.Bookmark(
        [],
        bookmarkIns.bookmarksUser[bookmark].message,
        parseInt(bookmark),
        null,
        0,
        0,
      );
      optimisticBookmarks.push(optimisticBookmark);
    });
    setBookmarks(optimisticBookmarks);
  };

  if (isDisabled) {
    return null;
  }

  const className = 'Panel BookmarksPanel custom-scrollbar custom-scrollbar--hide-thumb custom-scrollbar--stable-center';

  const sortBookmarks = (bookmarkList) => {
    if (bookmarkList && bookmarkList.length > 0) {
      return bookmarkList.sort(sortByPageNumber);
    }
    return [];
  };

  return (
    <div
      className={className}
      style={{ display }}
      data-element="bookmarksPanel"
    >
      {bookmarks && bookmarks.length === 0 && (
        <div className="no-bookmarks">
          <SvgElement
            content="empty-bookmark"
            width={80}
            height={80}
          />
          <p>{t('message.noBookmarks')}</p>
        </div>
      )}
      {bookmarks &&
        sortBookmarks(bookmarks).map((bookmark, i) => (
          <Bookmark
            key={i}
            bookmark={bookmark}
            activeBookmark={activeBookmark}
            setActiveBookmark={(page) => setActiveBookmark(page)}
            isRootBookmark
            isVisible
          />
        ))}
    </div>
  );
};

BookmarksPanel.propTypes = propTypes;
BookmarksPanel.defaultProps = defaultProps;

export default withTranslation()(BookmarksPanel);
