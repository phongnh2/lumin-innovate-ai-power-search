import { Fonts, Colors } from 'constants/styles';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledCreateTeamContainer = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: ${Colors.PRIMARY_10};
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius-primary);
  border: 2px dashed ${Colors.PRIMARY_90};
  padding: 35px;
  transition: all 0.3s ease;
  &:disabled {
    opacity: 0.6;
  }
  ${mediaQuery.md`
    padding: 0;
  `}

  &:hover {
    cursor: pointer;
    background: ${Colors.PRIMARY_20};
  }
`;

export const StyledCreateTeamIconWrapper = styled.div`
  margin-bottom: 20px;
  ${mediaQuery.md`
    margin-bottom: 14px;
  `}
  ${mediaQuery.xl`
    margin-bottom: 21px;
  `}
`;

export const StyledCreateTeamTitle = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
`;
