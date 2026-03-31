import styled from 'styled-components';
import { Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Checkbox } from 'lumin-components/Shared/Checkbox';
import { notificationPanelThemeGetter } from 'theme-providers/NotificationPanelTheme';

export const CheckboxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  transition: background-color .3s ease;
  background-color: ${(props) => notificationPanelThemeGetter(props).BackgroundContainer};
  border-radius: 4px;
  margin-bottom: 4px;
`;

export const Text = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  transition: color .3s ease;
  color: ${(props) => notificationPanelThemeGetter(props).MainTitleColor};
  width: 80%;
  ${mediaQuery.md`
    max-width: 280px;
  `}
`;

export const CheckboxCustom = styled(Checkbox)`
  padding: 0;
`;
