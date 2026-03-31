/* eslint-disable react/no-find-dom-node */
/* eslint-disable react/static-property-placement */
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import { isMac, isIOS, isAndroid } from 'helpers/device';

import './Tooltip.scss';
import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles/Colors';
import { TOOLS_WITH_SHORT_CUT } from 'constants/toolsName';

const defaultStyle = {
  fontSize: '12px',
  fontWeight: 500,
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: '16px',
  width: 'max-content',
};
class Tooltip extends React.PureComponent {
  static propTypes = {
    location: PropTypes.oneOf([
      'top',
      'right',
      'bottom',
      'left',
      'bottom-end',
    ]),
    delayShow: PropTypes.number,
    children: PropTypes.element,
    content: PropTypes.string,
    interpolation: PropTypes.object,
    isDisabled: PropTypes.bool,
    t: PropTypes.func.isRequired,
    themeMode: PropTypes.string,
    additionalClass: PropTypes.string,
    zoom: PropTypes.number,
    subContent: PropTypes.string,
    title: PropTypes.string,
  };

  static defaultProps = {
    location: 'bottom',
    delayShow: 200,
    content: '',
    children: <div />,
    isDisabled: false,
    themeMode: '',
    additionalClass: '',
    zoom: 0,
    subContent: '',
    interpolation: {},
    title: '',
  };

  constructor(props) {
    super(props);
    this.showTimer = null;
    this.opacityTimeout = 50; // This is used for tooltip fade-in animation
    this.state = {
      show: false,
      style: {
        top: 0,
        left: 0,
        opacity: 0,
      },
    };
  }

  componentDidMount() {
    if (!this.props.isDisabled) {
      this.addEventListeners(ReactDOM.findDOMNode(this));
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.show && this.state.show) {
      this.setPosition(ReactDOM.findDOMNode(this));
      setTimeout(() => {
        this.setOpacity(1);
      }, this.opacityTimeout);
    }

    if (prevState.show && !this.state.show) {
      this.setOpacity(0);
    }

    if (prevProps.isDisabled && !this.props.isDisabled) {
      this.addEventListeners(ReactDOM.findDOMNode(this));
    }
    if (prevProps.zoom !== this.props.zoom) {
      this.hide();
    }
  }

  componentWillUnmount() {
    if (!this.props.isDisabled) {
      this.removeEventListeners(ReactDOM.findDOMNode(this));
    }
  }

  addEventListeners = (DOMElement) => {
    try {
      DOMElement.addEventListener('mouseenter', this.show);
      DOMElement.addEventListener('mouseleave', this.hide);
      DOMElement.addEventListener('click', this.hide);
    } catch (e) {
      // we have this catch block here just to make sure UI doesn't blow up when DOMElement is null
      // although we haven't met this situation yet
      console.warn(`${this.props.children} is rendering null`);
    }
  };

  removeEventListeners = (DOMElement) => {
    try {
      DOMElement.removeEventListener('mouseenter', this.show);
      DOMElement.removeEventListener('mouseleave', this.hide);
      DOMElement.removeEventListener('click', this.hide);
    } catch (e) {
      // we have this catch block here just to make sure UI doesn't blow up when DOMElement is null
      // although we haven't met this situation yet
      console.warn(`${this.props.children} is rendering null`);
    }
  };

  setPosition = (DOMElement) => {
    const { location } = this.props;
    const {
      top, bottom, left, right, width, height,
    } = DOMElement.getBoundingClientRect();
    const locationPositionMap = {
      bottom: {
        top: bottom,
        left: left + width / 2,
      },
      left: {
        top: top + height / 2,
        left,
      },
      right: {
        top: top + height / 2,
        left: right,
      },
      top: {
        top,
        left: left + width / 2,
      },
      'bottom-end': {
        top: bottom,
        right: window.innerWidth - right,
        left: 'auto',
      },
    };

    const { top: tooltipTop, left: tooltipLeft, right: tooltipRight } = locationPositionMap[location];
    const newState = {
      style: {
        ...this.state.style,
        top: tooltipTop,
        left: tooltipLeft,
        right: tooltipRight,
      },
    };
    this.setState(newState);
  };

  setOpacity = (opacity) => {
    this.setState({
      style: {
        // eslint-disable-next-line react/no-access-state-in-setstate
        ...this.state.style,
        opacity,
      },
    });
  };

  show = () => {
    this.showTimer = setTimeout(() => {
      this.setState({ show: true });
    }, this.props.delayShow - this.opacityTimeout);
  };

  hide = () => {
    clearTimeout(this.showTimer);
    this.setState({ show: false });
  };

  shouldShowShortCut = () => {
    const { title, t } = this.props;
    if (!title.split('.')[1] || !TOOLS_WITH_SHORT_CUT.includes(title.split('.')[1])) {
      return false;
    }
    return t(`shortcut.${title.split('.')[1]}`).indexOf('.') === -1;
  };

  renderContent = () => {
    const {
      t, subContent, themeMode, interpolation, content, title
    } = this.props;
    // title only recive translated key
    const tooltipTitle = title.trim() ? t(title, interpolation) : '';

    const styleShortcutTheme = {
      color: themeMode === THEME_MODE.LIGHT ? Colors.NEUTRAL_20 : Colors.NEUTRAL_80,
    };

    if (tooltipTitle || content) {
      // If shortcut.xxx exists in translation-en.json file
      // method t will return the shortcut, otherwise it will return shortcut.xxx
      const hasShortcut = this.shouldShowShortCut();

      return (
        <>
          {`${tooltipTitle} `}
          {`${content} `}
          {hasShortcut &&
            <span className="tooltip__shortcut" style={styleShortcutTheme}>{this.renderShortcut()}</span>}
          {subContent && <span className="tooltip__shortcut" style={styleShortcutTheme}>{subContent}</span>}
        </>
      );
    }

    return null;
  };

  renderShortcut = () => {
    const { t, title } = this.props;

    const shortcut = t(`shortcut.${title.split('.')[1]}`);

    return isMac ? shortcut.replace('Ctrl', 'Cmd') : shortcut;
  };

  renderChildren = () => {
    const { children, isDisabled } = this.props;
    const { type } = children;
    if (type === 'div') {
      // an example is the advanced button in the search overlay
      // we don't want to add isDisabled to a DOM element since it's not a valid HTML attribute
      return React.cloneElement(children);
    }
    if (typeof type === 'function' || typeof type === 'object') {
      // children is a React component such as <ActionButton />
      return React.cloneElement(children, { disabled: isDisabled });
    }

    return null;
  };

  // eslint-disable-next-line class-methods-use-this
  renderStyleTheme = (theme) => {
    if (theme === THEME_MODE.LIGHT) {
      return {
        ...defaultStyle,
        background: Colors.NEUTRAL_100,
        color: Colors.NEUTRAL_0,
      };
    }
    return {
      ...defaultStyle,
      background: Colors.NEUTRAL_40,
      color: Colors.NEUTRAL_100,
    };
  };

  render() {
    const {
      location, title, themeMode, additionalClass, content,
    } = this.props;
    const isUsingMobileDevices = isIOS || isAndroid;
    const styleContentTheme = this.renderStyleTheme(themeMode);
    const styleLocationTheme = {
      background: themeMode === THEME_MODE.LIGHT ? Colors.NEUTRAL_100 : Colors.NEUTRAL_40,
    };
    return (
      <>
        {this.renderChildren()}
        {
          this.state.show && (title || content) && !isUsingMobileDevices &&
          ReactDOM.createPortal(
            <div className={`tooltip--${location} ${additionalClass}`} style={{ ...this.state.style, ...styleLocationTheme }}>
              <div className="tooltip__content" style={styleContentTheme}>
                {this.renderContent()}
              </div>
            </div>,
            document.getElementById('app'),
          )
        }
      </>
    );
  }
}

export default Tooltip;
