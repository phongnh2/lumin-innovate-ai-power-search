import styled, { css } from 'styled-components';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { Colors, Shadows } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { typographies } from 'constants/styles/editor';

const lightTheme = {
  background: Colors.OTHER_1,
  border: `1px solid ${Colors.SECONDARY_40}`,
  boxShadow: Shadows.SHADOW_XS,
  disconnectMessColor: Colors.SECONDARY_60,
  retryingMessColor: Colors.NEUTRAL_60,
  offlineBackground: Colors.PRIMARY_20,
  offlineBorder: `1px solid ${Colors.PRIMARY_40}`,
  offlineSuccessBackground: Colors.SUCCESS_10,
  offlineSuccessBorder: `1px solid ${Colors.SUCCESS_50}`,
  offlineSuggestText: Colors.PRIMARY_90,
  btnBackground: Colors.PRIMARY_40,
};

const darkTheme = {
  background: Colors.SECONDARY_70,
  border: `1px solid ${Colors.SECONDARY_60}`,
  boxShadow: Shadows.SHADOW_XS_DARK,
  disconnectMessColor: Colors.NEUTRAL_10,
  retryingMessColor: Colors.NEUTRAL_5,
  offlineBackground: Colors.PRIMARY_20,
  offlineBorder: `1px solid ${Colors.PRIMARY_40}`,
  offlineSuccessBackground: Colors.SUCCESS_10,
  offlineSuccessBorder: `1px solid ${Colors.SUCCESS_50}`,
  offlineSuggestText: Colors.PRIMARY_90,
  btnBackground: Colors.PRIMARY_40,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const DisconnectToastContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: rgba(16, 45, 66, 0.5);
  position: fixed;
  z-index: 9999;
`;

export const DisconnectToast = styled.div`
  position: absolute;
  background: ${({ theme }) => theme.background};
  border: ${({ theme }) => theme.border};
  box-shadow: ${({ theme }) => theme.boxShadow};
  border-radius: 8px;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-style: normal;
  line-height: 20px;

  i {
    color: ${({ theme }) => theme.disconnectMessColor};
  }
`;

export const LostConnectionMessage = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.disconnectMessColor};
  margin-left: 11px;
`;

export const RetryingMessage = styled.span`
  margin-left: 76px;
  font-weight: normal;
  color: ${({ theme }) => theme.retryingMessColor};
`;

export const OfflineSuggest = styled.div`
  position: absolute;
  background: ${({ theme, $isSuccess }) => ($isSuccess ? theme.offlineSuccessBackground : theme.offlineBackground)};
  border: ${({ theme, $isSuccess }) => ($isSuccess ? theme.offlineSuccessBorder : theme.offlineBorder)};
  box-shadow: ${({ theme }) => theme.boxShadow};
  border-radius: 8px;
  top: 180px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-style: normal;
  line-height: 20px;
  ${mediaQuery.md`
     top: 160px;
  `}
  i {
    color: ${({ theme }) => theme.offlineSuggestText};
  }
`;

export const OfflineMessage = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.offlineSuggestText};
  margin-left: 11px;
`;

export const Email = styled.span`
  color: ${Colors.PRIMARY_80};
`;

export const EnableButton = styled(ButtonMaterial)`
  background-color: ${({ theme }) => theme.btnBackground};
  color: ${({ theme }) => theme.offlineSuggestText};
  margin-left: 36px;
  max-height: 36px;

  ${css`
    &:hover {
      background-color: ${({ theme }) => theme.btnBackground};
    }
  `}
`;

export const ExtraWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ExtraContent = styled.div`
  color: ${({ theme }) => theme.le_error_error};
  ${{ ...typographies.le_label_large }}
`;
