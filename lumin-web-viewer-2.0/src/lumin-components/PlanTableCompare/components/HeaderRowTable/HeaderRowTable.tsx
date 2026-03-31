import React from 'react';

import { Colors } from 'constants/styles';
import { PLAN_TYPE_LABEL } from 'constants/plan';

import * as Styled from './HeaderRowTable.styled';

const DEFAULT_EMPTY_BACKGROUND_COLOR = Colors.PRIMARY_10;

const HeaderRowTable = ({
  plans,
  showPlanTable,
}: {
  plans: { plan: string; color: string }[];
  showPlanTable: boolean;
}): JSX.Element => (
  <Styled.HeadRow $showPlanTable={showPlanTable}>
    <span style={{ backgroundColor: DEFAULT_EMPTY_BACKGROUND_COLOR }} />
    {plans.map(({ plan, color }) => (
      <Styled.Wrapper key={plan}>
        <Styled.HeadCol>
          <Styled.Cell $color={color}>{PLAN_TYPE_LABEL[plan as keyof typeof PLAN_TYPE_LABEL]}</Styled.Cell>
        </Styled.HeadCol>
      </Styled.Wrapper>
    ))}
  </Styled.HeadRow>
);

export default HeaderRowTable;
