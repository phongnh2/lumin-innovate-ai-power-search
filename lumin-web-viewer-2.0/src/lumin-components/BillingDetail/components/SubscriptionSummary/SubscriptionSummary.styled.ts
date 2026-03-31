import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
`;

export const Avatar = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  ${mediaQuery.md`
    margin-top: 0;
    justify-content: flex-end;
  `}
`;

export const Name = styled.p`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-left: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const Plan = styled.h4`
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  margin: 0;
  color: ${Colors.NEUTRAL_90};
  white-space: nowrap;
`;

export const Info = styled.div`
  ${mediaQuery.md`
    display: grid;
    grid-template-columns: min-content minmax(0, 1fr);
    gap: 16px;
  `}
`;
