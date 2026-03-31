import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { makeStyles } from '@mui/styles';
import React, { useContext } from 'react';
import { css } from 'styled-components';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import Dialog from 'luminComponents/Dialog';
import SvgElement from 'luminComponents/SvgElement';

import { useTabletMatch, useTranslation } from 'hooks';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { Fonts, Colors } from 'constants/styles';

import CookieWarningModalContext from './Context';

function CookieWarningModal() {
  const { isVisible, setCookieModalVisible } = useContext(CookieWarningModalContext);
  const isTabletUp = useTabletMatch();
  const useStyle = makeStyles({
    dialog: {
      padding: '24px',
      paddingBottom: isTabletUp ? '24px' : '16px',
      textAlign: 'center',
      maxWidth: 400,
    },
    dialogTitle: {
      padding: 0,
      fontFamily: Fonts.PRIMARY,
      fontSize: isTabletUp ? 17 : 14,
      fontWeight: 600,
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: isTabletUp ? '24px' : '20px',
      letterSpacing: 0.34,
      textAlign: 'center',
      color: Colors.NEUTRAL_100,
      marginTop: isTabletUp ? 24 : 16,
    },
    dialogContent: {
      padding: 0,
      marginTop: 8,
      fontFamily: Fonts.PRIMARY,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '20px',
      color: Colors.NEUTRAL_80,
    },
  });
  const classes = useStyle();
  const { t } = useTranslation();

  return (
    <Dialog
      open={isVisible}
      maxWidth="xs"
      classes={{
        paper: classes.dialog,
      }}
    >
      <SvgElement
        content="third-party-cookie"
        maxWidth={154}
        alt="third-party-cookie"
        css={css`
          margin: 0 auto;
          min-height: 95px;
        `}
      />
      <DialogTitle
        disableTypography
        classes={{
          root: classes.dialogTitle,
        }}
      >
        {t('cookieWarning.title')}
      </DialogTitle>
      <DialogContent
        classes={{
          root: classes.dialogContent,
        }}
      >
        <span css={css`
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: ${Colors.NEUTRAL_80};
        `}
        >
          {t('cookieWarning.content')}
        </span>
        <ButtonMaterial
          css={css`
            width: 100%;
            margin-top: 16px;
            ${mediaQuery.md`
              margin-top: 36px;
            `}
          `}
          onClick={() => setCookieModalVisible(false)}
          size={isTabletUp ? ButtonSize.XL : ButtonSize.MD}
          fullWidth
        >
          {t('common.gotIt')}
        </ButtonMaterial>
      </DialogContent>
    </Dialog>
  );
}

export default CookieWarningModal;
