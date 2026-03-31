import React from 'react';

import * as Styled from './BentoMenu.styled';

function LogoLabel({ logo, borderColor }: ILogoLabel) {
  return <Styled.LogoWrapper borderColor={borderColor}>{logo}</Styled.LogoWrapper>;
}

interface ILogoLabel {
  logo: React.ReactElement;
  borderColor?: string;
}

export default LogoLabel;
