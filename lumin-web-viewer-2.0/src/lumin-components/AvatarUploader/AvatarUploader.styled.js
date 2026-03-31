/* eslint-disable sonarjs/no-identical-functions */
import styled, { css } from 'styled-components';
import PopperButton from 'lumin-components/PopperButton';
import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { Colors, Fonts, Shadows } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

const showInModal = (...args) => css`
  ${({ $showInModal }) => $showInModal && css(...args)}
`;

export const StyledContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledAvatar = styled.div`
  margin-right: 12px;
  line-height: 0;
  .MaterialAvatar {
    overflow: hidden;
  }
  ${mediaQuery.md`
    margin-right: 16px;
  `}
`;

export const StyledUploadContainer = styled.div``;

export const StyledTitle = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  letter-spacing: 0.34px;
  color: ${Colors.PRIMARY};
  margin-bottom: 4px;
`;

export const StyledNote = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin-top: 8px;
  ${({ hasTitle }) => hasTitle && `
    font-size: 14px;
    font-weight: 400;
    line-height: 1.43;
    letter-spacing: 0.34px;
    margin-bottom: 8px;
  `}

  ${({ $error }) => $error && `
    color: ${Colors.SECONDARY_50};
  `}

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin-top: 12px;
    ${showInModal`
      font-size: 12px;
      line-height: 16px;
      margin-top: 8px;
    `}
  `}
`;

export const StyledUploadButton = styled(ButtonMaterial)`
  background-color: ${Colors.WHITE};
  min-width: 140px;
  ${mediaQuery.md`
    min-width: 160px;
  `}
`;

export const StyledButtonWrapper = styled.div`
  .Popper__styleContent {
    border: 1px solid ${Colors.NEUTRAL_20};
    box-shadow: ${Shadows.SHADOW_XS};
    border-radius: 8px !important;
    box-sizing: border-box;
  }
`;

export const StyledPopperButton = styled(PopperButton)`
  min-width: 140px;
  height: 32px;
  border: 1px solid ${Colors.NEUTRAL_100};
  border-radius: var(--border-radius-primary);
  background-color: ${Colors.WHITE};
  text-transform: unset;
  ${mediaQuery.md`
    min-width: 160px;
    height: 40px;
    ${showInModal`
      height: 32px;
    `}
  `}
`;

export const StyledUploadText = styled.span`
  margin-left: 10px;
  ${showInModal`
    margin-left: 6px;
  `}
`;

export const StyledEditText = styled(StyledUploadText)`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    ${showInModal`
      font-size: 12px;
      line-height: 16px;
    `}
  `}
`;
