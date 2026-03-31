import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const OwnerWrapper = styled.div`
  display: flex;
  max-width: 100%;
  overflow: hidden;
`;

export const OwnerName = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: block;
  font-weight: normal;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};

  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
  `}
`;
