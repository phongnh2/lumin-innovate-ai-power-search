import { omit } from 'lodash';
import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

const VIEW_CONTAINER_ID = 'infiniteScrollViewElement';

class InfiniteScroll extends React.PureComponent {
  componentDidMount() {
    const { setScrollElement } = this.props;
    setScrollElement?.(document.getElementById(VIEW_CONTAINER_ID));
  }

  onScroll = (event) => {
    const { autoHeightMax, onLoadMore, hasNextPage, handleScrollParent, isFetchingData } = this.props;
    const { scrollTop, scrollHeight } = event.target;
    handleScrollParent();
    if (!hasNextPage || isFetchingData) {
      return;
    }
    if (scrollTop >= scrollHeight - autoHeightMax - 50) {
      onLoadMore();
    }
  };

  getScrollbarProps = () =>
    omit(this.props, [
      'hasNextPage',
      'onLoadMore',
      'handleScrollParent',
      'isFetchingData',
      'contentProps',
      'setScrollElement',
    ]);

  render() {
    const { autoHeightMax, contentProps } = this.props;
    return (
      <Scrollbars
        autoHide
        onScroll={throttle(this.onScroll, 100)}
        renderView={(props) => (
          <div
            {...props}
            style={{ ...props.style, marginBottom: 0, maxHeight: autoHeightMax, overflowX: 'hidden' }}
            {...contentProps}
            id={VIEW_CONTAINER_ID}
          />
        )}
        {...this.getScrollbarProps()}
      />
    );
  }
}

InfiniteScroll.propTypes = {
  autoHeightMax: PropTypes.number,
  hasNextPage: PropTypes.bool.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  handleScrollParent: PropTypes.func,
  isFetchingData: PropTypes.bool,
  contentProps: PropTypes.object,
  setScrollElement: PropTypes.func,
};

InfiniteScroll.defaultProps = {
  autoHeightMax: 250,
  isFetchingData: false,
  handleScrollParent: () => {},
  contentProps: {},
  setScrollElement: () => {},
};

export default InfiniteScroll;
