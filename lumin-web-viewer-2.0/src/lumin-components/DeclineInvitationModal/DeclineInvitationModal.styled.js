import styled from 'styled-components';
import { Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import ModalFooter from 'lumin-components/ModalFooter';
import { notificationPanelThemeGetter } from 'theme-providers/NotificationPanelTheme';

export const DialogContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: ${(props) => notificationPanelThemeGetter(props).TitleColor};
  margin: 16px 0 8px;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px; 
  `}
`;

export const Desc = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: ${(props) => notificationPanelThemeGetter(props).DescColor};
`;

export const CheckBoxContainer = styled.div`
  margin: 16px 0;
  width: 100%;
  ${mediaQuery.md`
    margin-bottom: 24px;
  `}
`;

export const ModalFooterCustom = styled(ModalFooter)`
  width: 100%;
  height: 40px;
  ${mediaQuery.md`
    height: 48px;
  `}
`;
