import PropTypes from 'prop-types';
import React from 'react';
import './SvgElement.scss';

const propTypes = {
  className: PropTypes.string,
  content: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  alt: PropTypes.string,
  styleInline: PropTypes.bool,
  isReskin: PropTypes.bool,
  classNameSvg: PropTypes.string,
};

const defaultProps = {
  className: '',
  width: 'auto',
  height: 'auto',
  maxWidth: 'none',
  alt: '',
  styleInline: true,
  isReskin: false,
  classNameSvg: '',
};

function SvgElement(props) {
  const {
    className,
    content,
    width,
    height,
    maxWidth,
    alt,
    styleInline,
    isReskin,
    classNameSvg,
  } = props;
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const svgElement = require(`../../../assets/${isReskin ? 'reskin/' : ''}lumin-svgs/${content}.svg`);
  const styles = styleInline ? { width, height } : {};
  return (
    <div
      className={`SvgElement ${className}`}
      style={{
        ...styles,
        maxWidth,
      }}
    >
      <img src={svgElement} alt={alt} className={classNameSvg} />
    </div>
  );
}

SvgElement.propTypes = propTypes;
SvgElement.defaultProps = defaultProps;

export default SvgElement;
