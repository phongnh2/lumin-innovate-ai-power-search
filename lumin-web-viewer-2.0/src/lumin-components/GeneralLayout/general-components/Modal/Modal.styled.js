import { makeStyles } from '@mui/styles';
import { Button } from 'lumin-ui/kiwi-ui';
import { typographies as kiwiTypographies } from 'lumin-ui/tokens';
import styled, { css } from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

import { ModalSize } from './constants';

const getStyleBySize = (size) => {
  switch (size) {
    case ModalSize.SMALL: {
      return {
        width: '360px',
        maxWidth: '360px',
        padding: spacings.le_gap_2,
      };
    }

    case ModalSize.LARGE: {
      return {
        width: 'var(--kiwi-sizing-dialogs-md)',
        maxWidth: 'var(--kiwi-sizing-dialogs-md)',
        padding: spacings.le_gap_3,
      };
    }

    case ModalSize.EXTRA_LARGE: {
      return {
        width: 'var(--kiwi-sizing-dialogs-lg)',
        maxWidth: 'var(--kiwi-sizing-dialogs-lg)',
        padding: spacings.le_gap_3,
      };
    }

    case ModalSize.MEDIUM:
    default: {
      return {
        width: 'var(--kiwi-sizing-dialogs-sm)',
        maxWidth: 'var(--kiwi-sizing-dialogs-sm)',
        padding: spacings.le_gap_3,
      };
    }
  }
};

export const useStyles = makeStyles({
  root: ({ priority }) => ({
    zIndex: `${priority} !important`,
  }),
  paper: ({ $size }) => ({
    display: 'flex',
    flexDirection: 'column',
    ...getStyleBySize($size),
  }),
});

export const BaseHeader = styled.div`
  margin-bottom: ${spacings.le_gap_1}px;
  ${kiwiTypographies.kiwi_typography_headline_lg}
  display: flex;
  flex-direction: column;
  ${(props) =>
    props.$center &&
    css`
      text-align: center;
      align-items: center;
    `}
`;

export const Header = styled(BaseHeader)`
  position: relative;
  & > * {
    ${(props) =>
      props.$center &&
      css`
        text-align: center;
      `}
  }
`;

export const BaseFooter = styled.div`
  margin-top: var(--base-gap-2x);
`;

export const Footer = styled(BaseFooter)`
  display: flex;
  > button:first-child {
    margin-left: auto;
  }
`;

export const SecondaryBtn = styled(Button)`
  margin-left: auto;
  margin-right: ${spacings.le_gap_2}px;
`;

export const PrimaryBtn = styled(Button)`
  min-width: calc(40px * 2.5);
`;

export const CloseButtonWrapper = styled.div`
  position: absolute;
  right: -9px;
  top: -4px;
  button {
    padding: 0px;
    min-width: 32px;
    width: 32px;
    height: 32px;
  }
`;

export const Title = styled.h3`
  ${kiwiTypographies.kiwi_typography_headline_lg}
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const Body = styled.div`
  margin-top: ${spacings.le_gap_1}px;
  ${(props) =>
    props.$center &&
    css`
      text-align: center;
    `}
  @include scrollbar-reskin;
  margin-top: 0;
  max-height: 100%;
  max-width: 100%;
  min-height: 18px;
  line-height: normal;
  display: flex;
  flex-direction: column;
  gap: 16px;
  ${kiwiTypographies.kiwi_typography_body_md}
  color: var(--kiwi-colors-surface-on-surface-variant);

  b {
    font-weight: var(--font-weight-bold);
  }
`;

export const CheckboxWrapper = styled.label`
  min-height: 32px;
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin-left: -4px;
  cursor: pointer;
  width: max-content;
  & div {
    width: 32px !important;
    height: 32px !important;
    padding: 0;
  }
  & span {
    ${({ $size }) => (['small', 'medium'].includes($size) ? typographies.le_body_medium : typographies.le_body_large)}
    color: ${({ theme }) => theme.le_main_on_surface_variant};
  }
`;

export const Icon = styled.img`
  width: 48px;
  margin: var(--base-gap) var(--base-gap) var(--base-gap) var(--base-gap);
`;

export const Description = styled.p``;
