import React from 'react';

import VacantCircleLeft from 'assets/images/vacant-circle-left.svg';
import VacantCircleRight from 'assets/images/vacant-circle-right.svg';
import * as Styled from './TempBillingDivider.styled';

function TempBillingDivider() {
  return (
    <Styled.Divider>
      <Styled.VacantCircleWrapper>
        <Styled.VacantCircle src={VacantCircleLeft} alt="vacant-circle-left" />
      </Styled.VacantCircleWrapper>

      <Styled.HorizontalBarContainer>
        <Styled.HorizontalBar />
      </Styled.HorizontalBarContainer>

      <Styled.VacantCircleWrapper $right>
        <Styled.VacantCircle src={VacantCircleRight} alt="vacant-circle-right" />
      </Styled.VacantCircleWrapper>
    </Styled.Divider>
  );
}

export default TempBillingDivider;
