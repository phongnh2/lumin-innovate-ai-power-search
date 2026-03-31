import styled from 'styled-components';

import BaseButtonIcon from 'lumin-components/Shared/ButtonIcon';

import { Colors, Fonts, Shadows } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  background-color: ${Colors.WHITE};
  padding: 18px 24px;
  border-radius: var(--border-radius-primary);
  box-shadow: ${Shadows.SHADOW_XS};
`;

export const Group = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.p`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
`;

export const ButtonText = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: ${Colors.SECONDARY_50};
  margin-right: 10px;
`;

export const ButtonHide = styled.div`
  cursor: pointer;

  &:hover {
    ${ButtonText} {
      text-decoration: underline;
    }
  }
`;

export const Wrapper = styled.div``;

export const List = styled.div`
  max-width: 480px;
`;

export const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid ${Colors.NEUTRAL_20};

  ${mediaQuery.xl`
    padding: 16px 0;
  `}
`;

export const ListItemText = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  margin-right: 32px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  ${mediaQuery.xl`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const ListItemIconWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ButtonIcon = styled(BaseButtonIcon)`
   &:last-child {
    margin-left: 32px;
  }
`;

export const ButtonWrapper = styled.div`
  padding-top: 18px;
`;
