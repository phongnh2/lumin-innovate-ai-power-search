import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import ButtonIcon from 'lumin-components/Shared/ButtonIcon';
import { Colors, Fonts } from 'constants/styles';
import { mediaQueryDown } from 'utils/styles/mediaQuery';

export const CssVariableProvider = styled.div`
  --preview-header: 72px;
  --modal-gap-with-window: 16px;
  --border-width: 2px;
  --preview-container-height: 100vh - var(--preview-header) * 2 - var(--modal-gap-with-window) * 2;
  ${mediaQueryDown.md`
    --preview-header: 56px;
  `}
`;

export const Title = styled.h2`
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  padding-right: 16px;
  word-break: break-word;
  ${mediaQueryDown.xl`
    font-size: 20px;
    line-height: 28px;
  `}
  ${mediaQueryDown.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const Header = styled.div`
  padding: 14px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${mediaQueryDown.md`
    padding: 8px 16px;
  `}
`;

export const ButtonClose = styled(ButtonIcon)`
  border-radius: 99px;
  background: ${Colors.NEUTRAL_5};
`;

export const PreviewContainer = styled.div`
  --address-bar-height: 96px;
  border-top: var(--border-width) solid ${Colors.NEUTRAL_20};
  border-bottom: var(--border-width) solid ${Colors.NEUTRAL_20};
  padding: 0 24px;
  overflow-y: auto;
  height: calc(var(--preview-container-height));
  /* detect iOS mobile */
  @supports (-webkit-touch-callout: none) {
    height: calc(var(--preview-container-height) - var(--address-bar-height));
  }
  ${mediaQueryDown.md`
    padding: 0;
  `}
`;

export const PreviewWrapper = styled.div`
  background: ${Colors.GRAY};
  min-height: calc(var(--preview-container-height) - var(--border-width) * 2);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${mediaQueryDown.md`
    padding: 0 16px;
  `}
`;

export const ThumbContainer = styled.div`
  canvas:not(:last-child) {
    margin-bottom: 12px;
  }
`;

export const InfoContainer = styled.div`
  padding: 16px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${mediaQueryDown.md`
    padding: 8px 16px;
  `}
`;

export const InfoLeftGroup = styled.div`
  display: flex;
  align-items: center;
`;

export const ViewCount = styled.span`
  font-size: 17px;
  line-height: 24px;
  font-weight: 400;
  margin: 0 44px 0 16px;
  display: inline-block;
  ${mediaQueryDown.md`
    margin: 0 24px 0 8px;
  `}
`;

export const DownloadCount = styled.span`
  font-size: 17px;
  line-height: 24px;
  font-weight: 400;
  margin-left: 16px;
  display: inline-block;
  ${mediaQueryDown.md`
    margin-left: 8px;
  `}
`;

export const ButtonUseTemplate = styled(ButtonMaterial)`
  min-width: 160px;
`;

export const DescContainer = styled.div`
  padding: 16px 32px 32px;
`;

export const DescTitle = styled.h3`
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  margin: 0 0 12px 0;
`;

export const HDivider = styled.hr`
  background: ${Colors.NEUTRAL_20};
  height: 1px;
  border: none;
  margin: 0 32px;
  box-shadow: none;
`;

export const Desc = styled.p`
  font-family: ${Fonts.SECONDARY};
  font-size: 16px;
  line-height: 24px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;
