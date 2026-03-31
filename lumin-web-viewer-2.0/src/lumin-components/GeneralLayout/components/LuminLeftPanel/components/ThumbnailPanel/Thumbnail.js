import classNames from 'classnames';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import ThumbnailMenu from './ThumbnailMenu';
import ThumbnailOverlayBtns from './ThumbnailOverlayBtns';

import * as Styled from './ThumbnailPanel.styled';

const LOAD_THUMBNAIL_DEBOUNCE_TIME = 100;
const THUMBNAIL_VERTICAL_MARGIN = 8;

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
    if (!prevProps.canLoad && this.props.canLoad) {
      this.loadThumbnailAsyncDelayed();
    }
    if (prevProps.canLoad && !this.props.canLoad) {
      this.props.onCancel(this.props.index);
    }
  }

  componentWillUnmount() {
    core.removeEventListener('pagesUpdated', this.onLayoutChangedHandler);
    this.props.onRemove(this.props.index);
  }

  onPagesUpdated(changes) {
    const currentPage = this.props.index + 1;

    const isPageAdded = changes.added.indexOf(currentPage) > -1;
    const isPageRemoved = changes.removed.indexOf(currentPage) > -1;
    const didPageMove = Object.keys(changes.moved).some((movedPage) => currentPage === parseInt(movedPage));
    const didPageChange = changes.contentChanged.some((changedPage) => currentPage === changedPage);

    const newPageCount = this.props.pageLabels.length - changes.removed.length;
    if (changes.removed.length > 0 && this.props.index + 1 > newPageCount) {
      // don't load thumbnail if it's going to be removed
      return;
    }

    if (isPageAdded || didPageChange || didPageMove || isPageRemoved) {
      this.loadThumbnailAsyncDelayed();
      if (this.props.updateAnnotations) {
        this.props.updateAnnotations(this.props.index);
      }
    }
  }

  loadThumbnailAsync = () => {
    const { thumbContainer } = this;
    const { current } = thumbContainer;
    const pageNum = this.props.index + 1;
    if (!core.getDocument() && core.getPageInfo(pageNum)) {
      return;
    }

    const id = core.loadThumbnail(pageNum, (thumb) => {
      thumb.className = 'page-image';
      thumb.style.width = `${this.props.imageDimentsion.width}px`;
      thumb.style.height = `${this.props.imageDimentsion.height}px`;
      const childElement = current?.querySelector('.page-image');

      if (childElement) {
        current.removeChild(childElement);
      }
      current?.appendChild(thumb);

      if (this.props.updateAnnotations) {
        this.props.updateAnnotations(this.props.index);
      }

      this.props.onFinishLoading(this.props.index);
    });
    this.props.onLoadThumbnail(this.props.index, this.thumbContainer.current, id);
  };

  handleClick = () => {
    const { index } = this.props;
    core.setCurrentPage(index + 1);
  };

  render() {
    const {
      index,
      currentPage,
      pageLabels,
      t,
      isPortray,
      wrapperStyle,
      disabled,
      isInContentEditMode,
      disabledAction,
    } = this.props;
    const isActive = currentPage === index + 1;
    const pageLabel = pageLabels[index];
    return (
      <Styled.ThumbnailOuterWrapper
        style={{
          height: wrapperStyle.height + THUMBNAIL_VERTICAL_MARGIN,
          width: wrapperStyle.width,
        }}
      >
        <Styled.ThumbnailWrapper
          className={classNames({
            active: isActive,
          })}
          onClick={this.handleClick}
          role="button"
          tabIndex={0}
          data-disabled={disabled}
          style={{
            height: wrapperStyle.height,
          }}
        >
          <Styled.ThumbnailContentWrapper $isPortray={isPortray}>
            <Styled.ThumbContainer ref={this.thumbContainer} />
          </Styled.ThumbnailContentWrapper>

          {!disabledAction && !isInContentEditMode && <ThumbnailOverlayBtns index={index} />}

          {!disabledAction && <ThumbnailMenu index={index} isThumbnailActive={isActive} />}

          <Styled.ThumbnailOverlayMask />

          <Styled.ThumbnailLabel>
            {t('option.shared.page')} {pageLabel}
          </Styled.ThumbnailLabel>
        </Styled.ThumbnailWrapper>
      </Styled.ThumbnailOuterWrapper>
    );
  }
}

Thumbnail.propTypes = {
  index: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  pageLabels: PropTypes.array.isRequired,
  canLoad: PropTypes.bool.isRequired,
  onLoadThumbnail: PropTypes.func.isRequired,
  onFinishLoading: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  updateAnnotations: PropTypes.func,
  t: PropTypes.func,
  imageDimentsion: PropTypes.object,
  isPortray: PropTypes.bool.isRequired,
  wrapperStyle: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  isInContentEditMode: PropTypes.bool.isRequired,
  disabledAction: PropTypes.bool,
};

Thumbnail.defaultProps = {
  updateAnnotations: () => {},
  t: () => {},
  imageDimentsion: {},
  disabled: false,
  disabledAction: false,
};

const mapStateToProps = (state) => ({
  currentPage: selectors.getCurrentPage(state),
  pageLabels: selectors.getPageLabels(state),
});

const mapDispatchToProps = {};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Thumbnail));
