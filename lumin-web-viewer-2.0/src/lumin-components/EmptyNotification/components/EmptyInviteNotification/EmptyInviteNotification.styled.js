import styled from 'styled-components';
import { notificationPanelThemeGetter } from 'theme-providers/NotificationPanelTheme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Text = styled.p`
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => notificationPanelThemeGetter(props).TextColor};
  margin: 16px 0 0;
`;

export const ImgWrapper = styled.div`
  width: 93px;
  margin-top: 56px;
`;

export const ImgContainer = styled.div`
  width: 100%;
  padding-top: 103%;
  position: relative;
  height: 0;
`;

export const Img = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;
