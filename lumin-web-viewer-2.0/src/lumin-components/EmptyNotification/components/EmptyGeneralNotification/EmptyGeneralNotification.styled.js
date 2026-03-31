import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { notificationPanelThemeGetter } from 'theme-providers/NotificationPanelTheme';

export const Container = styled.div`
  padding: 16px 24px;
`;

export const Time = styled.span`
  display: block;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: ${(props) => notificationPanelThemeGetter(props).TextColor};
  margin-bottom: 16px;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr;
  column-gap: 10px;
`;

export const Avatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${Colors.SECONDARY_50};
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

export const Description = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: ${(props) => notificationPanelThemeGetter(props).TextColor};
  p:not(:last-child) {
    margin-bottom: 24px;
  }
`;
