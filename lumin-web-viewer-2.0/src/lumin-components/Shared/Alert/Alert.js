import React from 'react';
import PropTypes from 'prop-types';

import * as Styled from './Alert.styled';

const AlertType = {
  error: 'error',
};

const Alert = ({
  className, children, type, style,
}) => (
  <Styled.Container type={type} className={className} style={style}>
    <Styled.Content>
      {children}
    </Styled.Content>
  </Styled.Container>
);

Alert.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(Object.values(AlertType)),
  style: PropTypes.object,
};

Alert.defaultProps = {
  className: '',
  type: AlertType.error,
  style: {},
};

export default Alert;
