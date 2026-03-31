import { ArrowSquareOutIcon } from '@luminpdf/icons/dist/csr/ArrowSquareOut';
import { useLocalStorage } from '@mantine/hooks';
import classNames from 'classnames';
import { Button, Dialog } from 'lumin-ui/kiwi-ui';
import React from 'react';

import defaultFileHandleImgDark from 'assets/images/local-file-introduction-dark.png';
import defaultFileHandleImg from 'assets/images/local-file-introduction.png';

import { useIsDarkMode, useIsLightMode, useThemeMode } from 'hooks/useThemeMode';
import { useTranslation } from 'hooks/useTranslation';

import { isMac } from 'helpers/device';

import { LocalStorageKey } from 'constants/localStorageKey';

import styles from './DefaultFileHandle.module.scss';

type DefaultFileHandleProps = {
  onClose: () => void;
};

const HELP_CENTER_LINK = {
  WIN: 'https://help.luminpdf.com/how-do-i-set-lumin-as-my-default-pdf-viewer-on-a-windows-device',
  MAC: 'https://help.luminpdf.com/how-to-set-lumin-as-your-default-pdf-viewer-on-mac',
};

const DefaultFileHandle = ({ onClose }: DefaultFileHandleProps): JSX.Element => {
  const isLightMode = useIsLightMode();
  const isDarkMode = useIsDarkMode();
  const themeMode = useThemeMode();
  const [_, setClosePerSession] = useLocalStorage({
    key: LocalStorageKey.DISABLE_SET_DEFAULT_FILE_TUTORIAL,
    defaultValue: false,
  });
  const { t } = useTranslation();

  const getHelpCenterLink = (): string => {
    if (isMac) {
      return HELP_CENTER_LINK.MAC;
    }
    return HELP_CENTER_LINK.WIN;
  };

  const onClosePerSession = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setClosePerSession(true);
    onClose();
    window.open(getHelpCenterLink(), '_blank');
  };

  return (
    <Dialog
      classNames={{
        content: classNames({
          [styles.dialogContentInDarkMode]: isDarkMode,
        }),
      }}
      data-theme={themeMode}
      opened
      onClose={onClose}
      size="md"
    >
      <img
        src={isLightMode ? defaultFileHandleImg : defaultFileHandleImgDark}
        alt="default-file-handle"
        className={styles.introductionImage}
      />
      <h2 className={styles.title}>{t('viewer.openWithLuminByDefault')}</h2>
      <p className={styles.message}>{t('viewer.setLuminAsDefault')}</p>
      <div className={styles.buttonContainer}>
        <Button onClick={onClose} variant="text">
          {t('common.remindMeLater')}
        </Button>
        <Button
          component="a"
          href={getHelpCenterLink()}
          leftSection={<ArrowSquareOutIcon size={20} />}
          onClick={onClosePerSession}
        >
          {t('common.showMeHow')}
        </Button>
      </div>
    </Dialog>
  );
};

export default DefaultFileHandle;
