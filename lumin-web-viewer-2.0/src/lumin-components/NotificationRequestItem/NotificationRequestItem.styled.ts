import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { notificationPanelThemeGetter } from 'theme-providers/NotificationPanelTheme';

export const InviteItemContainer = styled.div`
  cursor: pointer;
  padding: 16px 24px 16px 22px;
  box-sizing: border-box;
  &:hover {
    background-color:${(props) => notificationPanelThemeGetter(props).ItemHoverColor};
  }
`;

export const DateTime = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${(props: any) => (notificationPanelThemeGetter(props).TextColor)};
`;

export const HeaderItem = styled.div`

`;

export const Wrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: max-content auto;
  column-gap: 10px;
  margin-top: 16px;
`;

export const LeftContent = styled.div``;

export const RightItem = styled.div``;

export const RightContent = styled.div`
  margin-bottom: 10px;
  color: ${(props: any) => notificationPanelThemeGetter(props).TextColor};
  font-size: 14px;
  line-height: 20px;
  b {
    font-weight: 600;
  }
`;

export const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 6px;
`;

export const NotificationButton = styled(ButtonMaterial)`
  padding: 8px 44px;
  font-size: 12px;
  line-height: 16px;
`;
