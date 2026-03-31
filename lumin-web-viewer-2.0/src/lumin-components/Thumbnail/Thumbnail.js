import React from 'react';
import { debounce } from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import core from 'core';
import { isMobile } from 'helpers/device';

import './ThumbnailLumin.scss';

export const THUMBNAIL_SIZE = 150;
const LOAD_THUMBNAIL_DEBOUNCE_TIME = 100;

class Thumbnail extends React.PureComponent {
  constructor(props) {
    super(props);
    this.thumbContainer = React.createRef();
    this.onLayoutChangedHandler = this.onPagesUpdated.bind(this);
    this.loadThumbnailAsyncDelayed = debounce(this.loadThumbnailAsync, LOAD_THUMBNAIL_DEBOUNCE_TIME);
  }

  componentDidMount() {
    this.loadThumbnailAsyncDelayed();
    core.addEventListener('pagesUpdated', this.onLayoutChangedHandler);
  }

  componentDidUpdate(prevProps) {
    const { onCancel, index } = this.props;

    if (!prevProps.canLoad && this.props.canLoad) {
      this.loadThumbnailAsyncDelayed();
    }
    if (prevProps.canLoad && !this.props.canLoad) {
      onCancel(index);
    }
  }

  componentWillUnmount() {
    const { onRemove, index } = this.props;
    core.removeEventListener('pagesUpdated', this.onLayoutChangedHandler);
    onRemove(index);
  }

  onPagesUpdated(changes) {
    const { contentChanged, moved, added, removed } = changes;
    const { index, pageLabels } = this.props;

    const currentPage = index + 1;

    const isPageAdded = added.indexOf(currentPage) > -1;
    const didPageChange = contentChanged.some((changedPage) => currentPage === changedPage);
    const didPageMove = Object.keys(moved).some((movedPage) => currentPage === parseInt(movedPage));
    const isPageRemoved = removed.indexOf(currentPage) > -1;
    const newPageCount = pageLabels.length - removed.length;
    if (removed.length > 0 && index + 1 > newPageCount) {
      // don't load thumbnail if it's going to be removed
      return;
    }

    if (isPageAdded || didPageChange || didPageMove || isPageRemoved) {
      this.loadThumbnailAsyncDelayed();
      if (this.props.updateAnnotations) {
        this.props.updateAnnotations(index);
      }
    }
  }

  loadThumbnailAsync = () => {
    const { index, onLoadThumbnail } = this.props;
    const { thumbContainer } = this;
    const { current } = thumbContainer;
    const pageNum = index + 1;
    if (!core.getDocument() && core.getPageInfo(pageNum)) {
      return;
    }

    const id = core.loadThumbnail(pageNum, (thumb) => {
      thumb.className = 'page-image';
      thumb.style.maxWidth = `${THUMBNAIL_SIZE}px`;
      thumb.style.maxHeight = `${THUMBNAIL_SIZE}px`;

      const childElement = current?.querySelector('.page-image');
      if (childElement) {
        current.removeChild(childElement);
      }
      current?.appendChild(thumb);
      if (this.props.updateAnnotations) {
        this.props.updateAnnotations(index);
      }

      this.props.onFinishLoading(index);
    });
    onLoadThumbnail(index, this.thumbContainer.current, id);

    return id;
  };

  handleClick = (e) => {
    const {
      index,
      closeElement,
      selectedPageIndexes,
      setSelectedPageThumbnails,
      isThumbnailMultiselectEnabled,
    } = this.props;
    if (isThumbnailMultiselectEnabled) {
      const togglingSelectedPage = e.ctrlKey || e.metaKey;
      let updatedSelectedPages = [...selectedPageIndexes];
      if (togglingSelectedPage) {
        if (selectedPageIndexes.indexOf(index - 1) > -1) {
          updatedSelectedPages = selectedPageIndexes.filter((pageIndex) => index - 1 !== pageIndex);
        } else {
          updatedSelectedPages.push(index - 1);
        }
      } else {
        updatedSelectedPages = [];
      }

      setSelectedPageThumbnails(updatedSelectedPages);
    } else if (isMobile()) {
      closeElement('leftPanel');
    }

    core.setCurrentPage(index + 1);
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  onDragStart = (e) => {
    const { index, onDragStart } = this.props;
    onDragStart(e, index);
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  onDragOver = (e) => {
    const { index, onDragOver } = this.props;
    onDragOver(e, index);
  };

  render() {
    const { index, currentPage, pageLabels, t } = this.props;
    const isActive = currentPage === index + 1;
    const pageLabel = pageLabels[index];
    return (
      <div
        className={classNames({
          Thumbnail: true,
          active: isActive,
        })}
        onClick={this.handleClick}
        role="button"
        tabIndex={0}
      >
        <div className="container" ref={this.thumbContainer} />
        <div className="page-label">
          {t('option.shared.page')} {pageLabel}
        </div>
      </div>
    );
  }
}

Thumbnail.propTypes = {
  index: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  pageLabels: PropTypes.array.isRequired,
  canLoad: PropTypes.bool.isRequired,
  isThumbnailMultiselectEnabled: PropTypes.bool,
  onLoadThumbnail: PropTypes.func.isRequired,
  onFinishLoading: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  updateAnnotations: PropTypes.func,
  closeElement: PropTypes.func.isRequired,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  setSelectedPageThumbnails: PropTypes.func,
  selectedPageIndexes: PropTypes.arrayOf(PropTypes.number),
  t: PropTypes.func,
};

Thumbnail.defaultProps = {
  updateAnnotations: () => {},
  onDragStart: () => {},
  onDragOver: () => {},
  setSelectedPageThumbnails: () => {},
  selectedPageIndexes: [],
  isThumbnailMultiselectEnabled: false,
  t: () => {},
};

export default withTranslation()(Thumbnail);
