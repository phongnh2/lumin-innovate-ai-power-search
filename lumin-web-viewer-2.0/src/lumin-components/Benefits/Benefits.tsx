/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';

import * as Styled from './Benefits.styled';

const BenefitList = ({ benefits }: { benefits: [string] }): JSX.Element => (
  <>
    {benefits.map((benefit, index) => (
      <Styled.Container key={index}>
        {/* @ts-ignore */}
        <Styled.IconWrapper className="icon-checked" size={18} />
        <Styled.Text>{benefit}</Styled.Text>
      </Styled.Container>
    ))}
  </>
);

export default BenefitList;
