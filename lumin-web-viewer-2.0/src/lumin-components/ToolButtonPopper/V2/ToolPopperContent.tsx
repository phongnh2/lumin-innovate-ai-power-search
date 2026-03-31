import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import { useThemeMode } from 'hooks';
import { useTranslation } from 'hooks/useTranslation';

import { formatTitleCaseByLocale } from 'utils/common';

import { POPPER_PERMISSION_TYPE } from 'constants/documentConstants';

import * as css from '../ToolButtonPopper.styled';

import styles from './ToolPopperContent.module.scss';

interface IProps {
  largeTitle?: boolean;
  toolPopper: {
    title: string;
    message: string;
    buttons: Array<{
      label: string;
      onClick: () => void;
    }>;
    type: keyof typeof POPPER_PERMISSION_TYPE | null;
  };
  closePopper: () => void;
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
  handleOnOpenModal?: (type: keyof typeof POPPER_PERMISSION_TYPE) => void;
  icon:
    | string
    | {
        light: string;
        dark: string;
      };
}

export default function ToolPopperContent(props: IProps) {
  const { toolPopper, onPrimaryClick, onSecondaryClick, handleOnOpenModal, icon, closePopper, largeTitle } = props;
  const { t } = useTranslation();
  const theme = useThemeMode();
  const multipleButton = toolPopper.buttons.length === 2;

  const onSingleButtonClick = () => {
    closePopper();
    handleOnOpenModal(toolPopper.type);
  };

  const getImage = () => {
    if (typeof icon === 'string') {
      return icon;
    }

    return icon[theme];
  };

  return (
    <div css={css.modalContainer}>
      <img src={getImage()} alt={toolPopper.title} css={css.icon} />
      <h3 css={[css.modalTitle, largeTitle && css.largeModalTitle]}>{toolPopper.title}</h3>
      <p css={css.modalContent}>{toolPopper.message}</p>
      {toolPopper.buttons.length === 1 && (
        <div css={css.singleButtonContainer}>
          <Button
            className={styles.fullHeightButton}
            wrapText
            variant="filled"
            size="md"
            fullWidth
            onClick={onPrimaryClick}
          >
            {formatTitleCaseByLocale(toolPopper.buttons[0].label)}
          </Button>
        </div>
      )}
      {toolPopper.type && (
        <div css={css.singleButtonContainer}>
          <Button
            className={styles.fullHeightButton}
            wrapText
            fullWidth
            variant="filled"
            size="md"
            onClick={onSingleButtonClick}
          >
            <Trans
              i18nKey="pageTitle.requestPermissionAccess"
              values={{ permission: t(POPPER_PERMISSION_TYPE[toolPopper.type].text).toLowerCase() }}
            />
          </Button>
        </div>
      )}
      {multipleButton && (
        <div css={css.multipleButtonContainer}>
          <Button
            className={styles.fullHeightButton}
            wrapText
            variant="outlined"
            size="md"
            fullWidth
            onClick={onSecondaryClick}
          >
            {formatTitleCaseByLocale(toolPopper.buttons[1].label)}
          </Button>
          <Button
            className={styles.fullHeightButton}
            wrapText
            variant="filled"
            size="md"
            fullWidth
            onClick={onPrimaryClick}
          >
            {formatTitleCaseByLocale(toolPopper.buttons[0].label)}
          </Button>
        </div>
      )}
    </div>
  );
}
