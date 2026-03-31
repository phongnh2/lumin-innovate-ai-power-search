import React from 'react';
import PropTypes from 'prop-types';
import {
  StyledContainer,
  StyledText,
  StyledLink,
} from './DisabledDataCollectionCard.styled';

function DisabledDataCollectionCard(props) {
  const { image, isLockActivities } = props;

  return (
    <StyledContainer>
      <img src={image} />
      <StyledText isLockActivities={isLockActivities}>
        Lumin isn't allowed to collect your data log. Go&nbsp;
        <StyledLink isLockActivities={isLockActivities} to="/setting/preferences">Settings</StyledLink>
        &nbsp;to turn it on
      </StyledText>
    </StyledContainer>
  );
}

DisabledDataCollectionCard.propTypes = {
  image: PropTypes.string,
  isLockActivities: PropTypes.bool,
};

DisabledDataCollectionCard.defaultProps = {
  image: '',
  isLockActivities: false,
};

export default DisabledDataCollectionCard;
