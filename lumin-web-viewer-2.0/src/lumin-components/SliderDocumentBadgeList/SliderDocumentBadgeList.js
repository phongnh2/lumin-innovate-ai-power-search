import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

import SliderDocumentBadgeItem from 'luminComponents/SliderDocumentBadgeItem';

import Arrows from './components/Arrows';
import * as Styled from './SliderDocumentBadgeList.styled';

const propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    type: PropTypes.string,
    avatarRemoteId: PropTypes.string,
    active: PropTypes.bool,
    onClick: PropTypes.func,
  })),
};
const defaultProps = {
  list: [],
};

const ARROW_CONTAINER_WIDTH = 48;
const RESIZE_DEBOUNCE_TIME = 600;

class SliderDocumentBadgeList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      shouldShowNavigation: false,
    };
    this.wrapper = React.createRef(null);
    this.list = React.createRef(null);
    this.itemContainerRef = React.createRef(null);
    this.scrollDistanceAnchors = [0];
    this.containerWidth = 0;
    this.onWindowResizeDebounced = debounce(this.onWindowResize, RESIZE_DEBOUNCE_TIME);
  }

  componentDidMount() {
    this.initNavigation();
    window.addEventListener('resize', this.onWindowResizeDebounced);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResizeDebounced);
  }

  onWindowResize = () => {
    this.initNavigation();
  }

  calculateScrollDistanceAnchors = () => {
    let width = 0;
    const childrenList = Array.from(this.itemContainerRef.children);
    childrenList.forEach((el) => {
      this.scrollDistanceAnchors.push(width += el.clientWidth);
    });
  }

  shouldShowNavigation = () => this.list && this.wrapper && this.wrapper.clientWidth < this.list.scrollWidth

  getScrollDistanceStep = () => this.containerWidth / 2;

  onNextClick = () => {
    this.scrollDistance(this.list.scrollLeft + this.getScrollDistanceStep());
  }

  onPrevClick = () => {
    this.scrollDistance(this.list.scrollLeft - this.getScrollDistanceStep());
  }

  getMaxScrollAnchor = () => this.list.scrollWidth - this.wrapper.clientWidth

  scrollDistance = (distance) => {
    if (!Number.isNaN(distance)) {
      distance = Math.min(Math.max(0, distance), this.getMaxScrollAnchor());
      this.list.scrollLeft = distance;
    }
  }

  initNavigation = () => {
    this.containerWidth = this.wrapper.clientWidth;
    this.calculateScrollDistanceAnchors();
    this.setState({
      shouldShowNavigation: this.shouldShowNavigation(),
    }, () => {
      this.scrollToActivedItem();
    });
  }

  scrollToActivedItem = () => {
    const { list } = this.props;
    const currentActiveIndex = list.findIndex((item) => item.active);
    if (currentActiveIndex > -1) {
      this.scrollDistance(this.scrollDistanceAnchors[currentActiveIndex] - ARROW_CONTAINER_WIDTH);
    }
  }

  render() {
    const { list } = this.props;
    const { shouldShowNavigation } = this.state;
    return (
      <Styled.Wrapper ref={(ref) => (this.wrapper = ref)}>
        <Styled.Container onScroll={this.onScroll} ref={(ref) => (this.list = ref)}>
          <Styled.ItemContainer ref={(ref) => this.itemContainerRef = ref}>
            {list.map((item) => (
              <Styled.Item key={item._id} data-id={item._id}>
                <SliderDocumentBadgeItem
                  title={item.title}
                  subtitle={item.subtitle}
                  avatarRemoteId={item.avatarRemoteId}
                  active={item.active}
                  onClick={item.onClick}
                  type={item.type}
                />
              </Styled.Item>
            ))}
          </Styled.ItemContainer>
        </Styled.Container>
        {shouldShowNavigation && (
          <Arrows
            onNextClick={this.onNextClick}
            onPrevClick={this.onPrevClick}
            listRef={this.list}
            maxScrollAnchor={this.getMaxScrollAnchor()}
          />
        )}
      </Styled.Wrapper>
    );
  }
}

SliderDocumentBadgeList.propTypes = propTypes;
SliderDocumentBadgeList.defaultProps = defaultProps;

export default SliderDocumentBadgeList;
