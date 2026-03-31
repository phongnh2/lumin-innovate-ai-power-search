import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Name = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  font-style: normal;
  letter-spacing: 0.34px;
  color: ${Colors.NEUTRAL_100};
  display: inline-block;
  max-width: 100%;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 0;
  `}
`;
