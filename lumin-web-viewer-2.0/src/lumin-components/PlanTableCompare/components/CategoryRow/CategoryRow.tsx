import React from 'react';

import { Plans } from 'constants/plan';

import * as Styled from './CategoryRow.styled';

const PaymentPlans = [Plans.FREE, Plans.ORG_STARTER, Plans.ORG_PRO, Plans.ORG_BUSINESS, Plans.ENTERPRISE];

const CategoryRow = ({ title }: { title: string }): JSX.Element => {
  const renderCell = (value: string): JSX.Element => <Styled.ValueCell key={`${title}_${value}`} />;
  return (
    <Styled.Row>
      <Styled.Col>
        <Styled.Cell>
          <Styled.Text>{title}</Styled.Text>
        </Styled.Cell>
      </Styled.Col>
      {PaymentPlans.map(renderCell)}
    </Styled.Row>
  );
};

export default CategoryRow;
