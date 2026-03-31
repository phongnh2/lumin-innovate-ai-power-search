import styled from 'styled-components';

import Icomoon from 'lumin-components/Icomoon';
import { Colors, Shadows } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { MAX_WIDTH_CONTAINER } from 'constants/lumin-common';

export const ButtonContainer = styled.div`
  margin: 0 0 16px;
  padding: 0px 16px;

  ${mediaQuery.md`
    margin-bottom: 24px;
    padding: 0px 48px;
  `}

  ${mediaQuery.xl`
    margin: 0 auto 32px;
    padding: 0px 18px;
    max-width: ${MAX_WIDTH_CONTAINER}px;
  `}
`;

export const ShowAllButton = styled.div`
  width: 100%;
  height: 40px;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${Colors.WHITE};
  border-radius: 8px;
  box-shadow: ${Shadows.SHADOW_M};
  cursor: pointer;

  ${mediaQuery.md`
    height: 48px;
    font-size: 14px;
    line-height: 20px;
  `}

  ${mediaQuery.xl`
    width: min-content;
    padding: 0 32px
  `}
`;

export const ButtonText = styled.p`
  text-align: right;
  width: max-content;
`;

export const PlanDetailCompareContainer = styled.div<{$show: boolean}>`
  padding: 0 0 0 16px;
  margin-bottom: 24px;

  ${mediaQuery.md<{$show: boolean}>`
    margin: 0 auto 40px;
    padding: 0 48px;
  `}

  ${mediaQuery.xl<{$show: boolean}>`
    margin-bottom: 56px;
    padding: 0;
    max-width: 1280px;
  `}
`;

export const ShowAllIcon = styled(Icomoon)<{$show: boolean}>`
  transform: rotateX(${({ $show }) => ($show ? '180deg' : '0')});
  transition: transform 0.3s ease;
  margin: 0;

  &::before {
    color: ${Colors.NEUTRAL_60};
    margin-left: 14px;
  }
`;