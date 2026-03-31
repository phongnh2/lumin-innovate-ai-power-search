/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FormControlLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  Button,
  ButtonSize as ReskinButtonSize,
  ButtonVariant,
  Dialog as ReskinDialog,
  Checkbox as ReskinCheckbox,
  IconButton,
} from 'lumin-ui/kiwi-ui';
import React, { ChangeEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import selectors from 'selectors';

import ButtonMaterial from 'luminComponents/ButtonMaterial';
import Dialog from 'luminComponents/Dialog';
import Icomoon from 'luminComponents/Icomoon';
import { Checkbox } from 'luminComponents/Shared/Checkbox';
import EditorThemeProvider from 'luminComponents/ViewerCommonV2/ThemeProvider';

import { useEnableWebReskin, useThemeMode, useTranslation } from 'hooks';

import DismissFreeTrialSurvey from 'features/CNC/CncComponents/DismissFreeTrialSurvey';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors, Breakpoints, Fonts, Shadows } from 'constants/styles';

import { lightThemeReskin, darkThemeReskin } from './constant';
import useGetContentTrialModal from './useGetContentTrialModal';

import * as Styled from './StartTrialModal.styled';

import styles from './StartTrialModal.module.scss';

const useStyles = makeStyles<any, { themeVariables: Record<string, string>; $openDismissFreeTrialSurvey: boolean }>(
  () => ({
    modalRoot: {
      zIndex: '1200 !important', // make this modal behind share modal when it triggered,
    },
    paper: {
      borderRadius: '16px',
      padding: '16px',
      backgroundColor: ({ themeVariables }) => themeVariables.dialogBg,
      boxShadow: ({ themeVariables }) => themeVariables.dialogBoxShadow,
      [`@media screen and (min-width: ${Breakpoints.md}px)`]: {
        maxWidth: ({ $openDismissFreeTrialSurvey }) => ($openDismissFreeTrialSurvey ? '480px' : '520px'),
        padding: '24px',
      },
    },
    closeButton: {
      top: '16px !important',
      right: '16px !important',
      [`@media screen and (min-width: ${Breakpoints.md}px)`]: {
        top: '24px !important',
        right: '24px !important',
      },
    },
    startTrialBtn: {
      fontFamily: `${Fonts.SECONDARY}`,
      marginTop: '16px',
      fontSize: '14px',
      lineHeight: '100%',
      fontWeight: ' 500',
      height: '40px',
      padding: '8px 16px',
      [`@media screen and (min-width: ${Breakpoints.md}px)`]: {
        marginTop: '24px',
      },
    },
    checkBox: {
      padding: '0px',
      borderRadius: '4px',
      '&:hover': {
        boxShadow: `${Shadows.CHECKBOX_SHADOW_RESKIN}`,
      },
    },
  })
);

type PropTypes = {
  onClose: ({ skip }: { skip: boolean }) => void;
  onClickStartTrial: ({ skip }: { skip: boolean }) => void;
  openDismissFreeTrialSurvey: boolean;
  onCloseDismissFreeTrialSurveyVariantModal: ({ skip }: { skip: boolean }) => void;
};

const StartTrialModal = ({
  onClose,
  onClickStartTrial,
  openDismissFreeTrialSurvey,
  onCloseDismissFreeTrialSurveyVariantModal,
}: PropTypes): JSX.Element => {
  const { t } = useTranslation();
  const themeMode = useThemeMode();
  const isOffline = useSelector<unknown, boolean>(selectors.isOffline);
  const { isEnableReskin } = useEnableWebReskin();
  const startTrialContent = 'common.startFreeTrial';

  const themeModeProvider: Record<string, unknown> = {
    [THEME_MODE.LIGHT]: lightThemeReskin,
    [THEME_MODE.DARK]: darkThemeReskin,
  };
  const themeVariables = themeModeProvider[themeMode] as Record<string, string>;

  const [skip, setSkip] = useState(false);

  const classes = useStyles({ themeVariables, $openDismissFreeTrialSurvey: openDismissFreeTrialSurvey }) as Record<
    string,
    string
  >;

  const dialogExtraProps = {
    classes: {
      root: classes.modalRoot,
      paper: classes.paper,
      closeButton: classes.closeButton,
    },
    closeBtn: {
      size: 13,
      color: themeVariables.closeBtnColor,
    },
  };

  const checkboxExtraProps = {
    classes: {
      root: classes.checkBox,
    },
  };

  const StyledComponents = {
    Container: Styled.ContainerReskin,
    DetailContainer: Styled.DetailContainerReskin,
    Title: Styled.TitleReskin,
    SubTitle: Styled.SubTitleReskin,
    CheckboxWrapper: Styled.CheckboxWrapperReskin,
    CheckboxLabel: Styled.CheckboxLabelReskin,
    DetailMessage: Styled.DetailMessageReskin,
  };

  const { contentModal } = useGetContentTrialModal();

  const renderTrialDetails = (): JSX.Element[] =>
    contentModal?.features.map((content, index) => (
      <Styled.DetailItem key={index}>
        <Icomoon className="check" color={Colors.SECONDARY_50} size={18} />
        <StyledComponents.DetailMessage>{content}</StyledComponents.DetailMessage>
      </Styled.DetailItem>
    ));

  const renderTrialDetailsReskin = (): JSX.Element[] =>
    contentModal?.features.map((content, index) => (
      <div className={styles.detailItem} key={index}>
        <Icomoon className="checkbox" color="var(--kiwi-colors-semantic-success)" size={24} />
        <div className={styles.detailMessage}>{content}</div>
      </div>
    ));

  const renderContent = () => {
    if (openDismissFreeTrialSurvey) {
      return (
        <DismissFreeTrialSurvey.VariantModal onClose={() => onCloseDismissFreeTrialSurveyVariantModal({ skip })} />
      );
    }

    return (
      <StyledComponents.Container aria-label="StartTrialModal">
        <Styled.Content>
          <StyledComponents.Title>{contentModal?.header}</StyledComponents.Title>
          <StyledComponents.SubTitle>{contentModal?.description}</StyledComponents.SubTitle>
          <StyledComponents.DetailContainer>{renderTrialDetails()}</StyledComponents.DetailContainer>
          <ButtonMaterial
            classes={{
              root: classes.startTrialBtn,
            }}
            fullWidth
            onClick={() => onClickStartTrial({ skip })}
          >
            {t(startTrialContent)}
          </ButtonMaterial>
          (
          <StyledComponents.CheckboxWrapper>
            <FormControlLabel
              control={
                <Checkbox
                  // @ts-ignore
                  border={themeVariables.checkboxBorder}
                  background={themeVariables.checkboxBg}
                  checkedColor={themeVariables.checkedColor}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSkip(e.target.checked)}
                  {...checkboxExtraProps}
                />
              }
              value={skip}
              label={<StyledComponents.CheckboxLabel>{t('common.doNotShowAgain')}</StyledComponents.CheckboxLabel>}
            />
          </StyledComponents.CheckboxWrapper>
          )
        </Styled.Content>
      </StyledComponents.Container>
    );
  };

  const renderReskinContent = () => {
    if (openDismissFreeTrialSurvey) {
      return (
        <DismissFreeTrialSurvey.VariantModal onClose={() => onCloseDismissFreeTrialSurveyVariantModal({ skip })} />
      );
    }
    return (
      <>
        <IconButton size="lg" icon="x-md" className={styles.closeButton} onClick={() => onClose({ skip })} />
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.wrapTitle}>
              <p className={styles.title}>{contentModal?.header}</p>
            </div>
            <p className={styles.subTitle}>{contentModal?.description}</p>
            <div className={styles.detailContainer}>{renderTrialDetailsReskin()}</div>
            <Button
              variant={ButtonVariant.filled}
              size={ReskinButtonSize.lg}
              className={styles.button}
              onClick={() => onClickStartTrial({ skip })}
            >
              {t(startTrialContent)}
            </Button>
            <div className={styles.checkboxWrapper}>
              <FormControlLabel
                classes={{
                  root: styles.checkBox,
                }}
                control={
                  <ReskinCheckbox
                    size="md"
                    borderColor="var(--kiwi-colors-surface-on-surface)"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSkip(e.target.checked)}
                  />
                }
                value={skip}
                label={<span className={styles.checkboxLabel}>{t('common.doNotShowAgain')}</span>}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  if (isEnableReskin) {
    return (
      <EditorThemeProvider>
        <ReskinDialog
          opened={!isOffline}
          centered
          onClose={() => onClose({ skip })}
          size={openDismissFreeTrialSurvey ? 'sm' : 'md'}
          padding="md"
          closeOnEscape={!openDismissFreeTrialSurvey}
          closeOnClickOutside={false}
          styles={{
            inner: {
              zIndex: 'var(--zindex-modal-low)',
            },
            overlay: {
              zIndex: 'var(--zindex-modal-low)',
            },
          }}
        >
          {renderReskinContent()}
        </ReskinDialog>
      </EditorThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={themeVariables}>
      {/* @ts-ignore */}
      <Dialog
        open={!isOffline}
        scroll="body"
        onClose={() => onClose({ skip })}
        hasCloseBtn={!openDismissFreeTrialSurvey}
        disableBackdropClick
        className={`Dialog theme-${themeMode}`}
        disableEscapeKeyDown={openDismissFreeTrialSurvey}
        {...dialogExtraProps}
      >
        {renderContent()}
      </Dialog>
    </ThemeProvider>
  );
};

export default StartTrialModal;
