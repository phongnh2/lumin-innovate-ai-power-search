import React from 'react';
import PropTypes from 'prop-types';

import { PERIOD } from 'constants/plan';
import Selected from 'assets/lumin-svgs/selected.svg';
import Unselected from 'assets/lumin-svgs/unselected.svg';

import * as Styled from './PlanSwitchComponent.styled';

const propTypes = {
  radioList: PropTypes.array,
  period: PropTypes.oneOf(Object.values(PERIOD)),
  onChange: PropTypes.func,
  hidePromote: PropTypes.bool,
};

const defaultProps = {
  radioList: [],
  period: PERIOD.MONTHLY,
  onChange: () => { },
  hidePromote: false,
};

const PlanSwitchComponent = ({
  radioList, period, onChange, hidePromote,
}) => (
  <Styled.Container>
    <Styled.Wrapper hidePromote={hidePromote}>
      {radioList.map((item, index) => {
        const isChecked = period === item.value;
        return (
          <Styled.ItemWrapper key={index}>
            <Styled.Group htmlFor={item.value}>
              <Styled.ImageWrapper>
                <Styled.Image src={isChecked ? Selected : Unselected} alt={isChecked ? 'Selected' : 'Unselected'} />
              </Styled.ImageWrapper>
              <Styled.Text checked={isChecked}>{item.label}</Styled.Text>
              <Styled.Input
                id={item.value}
                type="radio"
                checked={isChecked}
                onChange={() => onChange(item.value)}
                name="payment-period"
                data-lumin-btn-name={item.name}
                data-lumin-btn-purpose={item.purpose}
              />
            </Styled.Group>
          </Styled.ItemWrapper>
        );
      })}
    </Styled.Wrapper>
  </Styled.Container>
);

PlanSwitchComponent.propTypes = propTypes;
PlanSwitchComponent.defaultProps = defaultProps;

export default PlanSwitchComponent;
