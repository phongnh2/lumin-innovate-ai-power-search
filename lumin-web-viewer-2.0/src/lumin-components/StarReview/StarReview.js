import React from 'react';
import PropTypes from 'prop-types';

import HalfStar from 'assets/images/half-star-trust-pilot.svg';
import Star from 'assets/images/star-trust-pilot.svg';

import {
  StyledWrapperStar,
  StyledStar,
} from './StarReview.styled';

const StarReview = ({ numberStar, size }) => {
  const isInteger = Number.isInteger(numberStar);
  const number = isInteger ? numberStar : Math.floor(numberStar);

  return (
    <StyledWrapperStar>
      {Array(number).fill().map((_, index) => <StyledStar key={index} size={size} src={Star} alt="star trust pilot" />)}
      {!isInteger && <StyledStar size={size} src={HalfStar} alt="star trust pilot" />}
    </StyledWrapperStar>
  );
};

StarReview.propTypes = {
  numberStar: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
};

export default StarReview;
