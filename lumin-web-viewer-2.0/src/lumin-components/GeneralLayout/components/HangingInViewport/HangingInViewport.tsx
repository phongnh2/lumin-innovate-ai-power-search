/* eslint-disable arrow-body-style */
import React from 'react';

import * as Styled from './HangingInViewport.styled';

const HangingInViewport = ({ children }: { children: JSX.Element }): JSX.Element => {
  return (
    <Styled.Container>
      <Styled.Content>{children}</Styled.Content>

      <Styled.Backdrop />
    </Styled.Container>
  );
};

export default HangingInViewport;
