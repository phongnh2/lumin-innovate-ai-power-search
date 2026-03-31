import React from 'react';
import PropTypes from 'prop-types';

import './Icon.scss';

const defaultProps = {
  className: '',
};

const propTypes = {
  className: PropTypes.string,
  glyph: PropTypes.string.isRequired,
};

class Icon extends React.PureComponent {
  constructor() {
    super();
    this.icon = React.createRef();
  }

  // componentDidMount() {
  //   // this.updateSvg();
  // }

  // componentDidUpdate(prevProps) {
  //   if (this.props.glyph !== prevProps.glyph) {
  //     this.updateSvg();
  //   }
  // }

  // updateSvg() {
  // if (this.isInlineSvg()) {
  //   var domElement = this.icon.current;

  //   // remove existing svg
  //   while (domElement.firstChild) {
  //     domElement.removeChild(domElement.firstChild);
  //   }

  //   // innerHTML also works, but not in IE...
  //   const svg = new DOMParser()
  //     .parseFromString(this.props.glyph, 'image/svg+xml')
  //     .querySelector('svg');
  //   domElement.appendChild(svg);
  // }
  // }

  // isInlineSvg() {
  //   const { glyph } = this.props;
  //   return glyph && glyph.indexOf('<svg') === 0;
  // }

  render() {
    const { className, glyph } = this.props;

    return (
      <div
        ref={this.icon}
        className={`Icon ${className}`}
      >
        <img src={`./assets/${glyph}.svg`} />
      </div>
    );
  }
}

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default Icon;
