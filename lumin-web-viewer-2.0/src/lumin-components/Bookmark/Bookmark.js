import React from 'react';
import PropTypes from 'prop-types';

import Icomoon from 'luminComponents/Icomoon';

import { isMobile } from 'helpers/device';
import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';
import toolsName from 'constants/toolsName';

import './Bookmark.scss';
import core from 'core';
import { withTranslation } from 'react-i18next';

const propTypes = {
  bookmark: PropTypes.object.isRequired,
  closeElement: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired,
  setActiveBookmark: PropTypes.func,
  activeBookmark: PropTypes.number,
  isRootBookmark: PropTypes.bool,
  t: PropTypes.func,
};

const defaultProps = {
  setActiveBookmark: () => {},
  activeBookmark: -1,
  isRootBookmark: false,
  t: () => {},
};

class Bookmark extends React.PureComponent {
  state = {
    isExpanded: false,
  };

  onClickExpand = () => {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded,
    }));
  };

  onClickBookmark = () => {
    const { bookmark, closeElement, setActiveBookmark } = this.props;

    /* Fix for book mark VPOS and HPOS is 0 not correctly with pdftron v6.1 */
    if (!bookmark.getHorizontalPosition() && !bookmark.getVerticalPosition()) {
      core.setCurrentPage(bookmark.getPageNumber());
    } else {
      core.gotoOutline(bookmark);
    }
    /* END */
    setActiveBookmark(bookmark.getPageNumber());
    if (isMobile()) {
      closeElement('leftPanel');
    }
  };

  render() {
    const { bookmark, isVisible, closeElement, setActiveBookmark, activeBookmark, isRootBookmark, t } = this.props;
    const { isExpanded } = this.state;

    return (
      <div className={`Bookmark ${isVisible ? 'visible' : 'hidden'}`}>
        {bookmark.children.length > 0 && (
          <div className="padding">
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div className={`arrow ${isExpanded ? 'expanded' : 'collapsed'}`} onClick={this.onClickExpand}>
              <Icomoon className="next-page" />
            </div>
          </div>
        )}
        <div className="content">
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className={`title ${isRootBookmark && activeBookmark === bookmark.getPageNumber() ? 'title--bold' : ''}`}
            onClick={handlePromptCallback({
              callback: this.onClickBookmark,
              applyForTool: toolsName.REDACTION,
              translator: t,
            })}
          >
            <span className="title--page">{t('viewer.pageText', { text: bookmark.getPageNumber() })}</span>
            <span className="title--content">{bookmark.name}</span>
          </div>
          {bookmark.children.map((bookmark, i) => (
            <Bookmark
              bookmark={bookmark}
              key={i}
              isVisible={isExpanded}
              closeElement={closeElement}
              setActiveBookmark={setActiveBookmark}
            />
          ))}
        </div>
      </div>
    );
  }
}

Bookmark.propTypes = propTypes;
Bookmark.defaultProps = defaultProps;

export default withTranslation()(Bookmark);
