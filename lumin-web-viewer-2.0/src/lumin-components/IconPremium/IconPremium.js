import React from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useSelector } from 'react-redux';

import Icomoon from 'lumin-components/Icomoon';
import { Colors } from 'constants/styles';
import selectors from 'selectors';

import * as Styled from './IconPremium.styled';

const IconPremium = ({ className }) => {
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  return (
    currentUser && (
      <Styled.Container className={className}>
        <Icomoon className="premium" size={5} color={Colors.NEUTRAL_0} />
      </Styled.Container>
    )
  );
};

IconPremium.propTypes = {
  className: PropTypes.string,
};

IconPremium.defaultProps = {
  className: undefined,
};

export default IconPremium;
