import PropTypes from 'prop-types';
import React from 'react';

import RuberStampModalContent from './components/RubberStampModalContent';

import './RubberStampModal.scss';

const RubberStampModal = ({ isOpen }) => <RuberStampModalContent isOpen={isOpen} />;

RubberStampModal.propTypes = {
  isOpen: PropTypes.bool,
};
RubberStampModal.defaultProps = {
  isOpen: false,
};

export default RubberStampModal;
