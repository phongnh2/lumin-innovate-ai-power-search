import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Text = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};

  &:nth-child(2) {
    margin-top: 4px;

    ${mediaQuery.md`
      padding-bottom: 8px;
    `}
  }
`;
