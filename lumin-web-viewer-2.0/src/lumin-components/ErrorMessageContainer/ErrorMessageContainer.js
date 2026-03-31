import React from 'react';
import PropTypes from 'prop-types';

import './ErrorMessageContainer.scss';

const propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};

const defaultProps = {
  message: '',
  className: '',
};

const ErrorMessageContainer = ({ message, className }) => (
  <div className={`ErrorMessageContainer__wrapper ${className}`}>
    <p className="ErrorMessageContainer__message">{message}</p>
  </div>
);

ErrorMessageContainer.propTypes = propTypes;
ErrorMessageContainer.defaultProps = defaultProps;

export default ErrorMessageContainer;
