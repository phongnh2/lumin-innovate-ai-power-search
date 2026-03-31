import { StyledEngineProvider } from '@mui/material';
import i18next from 'i18next';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import Tooltip from '@new-ui/general-components/Tooltip';

import hoveredOutlineIcon from 'assets/images/outline-shortcut-hovered.svg';
import defaultOutlineIcon from 'assets/images/outline-shortcut.svg';

import { store } from 'store';

import EditorThemeProvider from 'luminComponents/ViewerCommonV2/ThemeProvider/EditorThemeProvider';

import { useTranslation } from 'hooks/useTranslation';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { readAloudSelectors } from 'features/ReadAloud/slices';

import styles from './OutlineShortcutButton.module.scss';

interface OutlineShortcutButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

const OutlineShortcutButton = (props: OutlineShortcutButtonProps) => {
  const { onClick } = props;
  const { t } = useTranslation();
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);

  if (isInReadAloudMode) {
    return null;
  }

  return (
    <Tooltip title={t('outlines.actions.addTo')}>
      <button
        data-lumin-btn-name={ButtonName.ADD_OUTLINE}
        data-lumin-btn-purpose="Add outline from page corner"
        className={styles.container}
        onClick={onClick}
      >
        <img className={styles.defaultIcon} src={defaultOutlineIcon} alt="outline icon" width={32} height={32} />
        <img className={styles.hoveredIcon} src={hoveredOutlineIcon} alt="outline icon" width={32} height={32} />
      </button>
    </Tooltip>
  );
};

const EnhancedOutlineShortcutButton = (props: OutlineShortcutButtonProps) => (
  <BrowserRouter>
    <StyledEngineProvider injectFirst>
      <Provider store={store}>
        <EditorThemeProvider>
          <I18nextProvider i18n={i18next}>
            <OutlineShortcutButton {...props} />
          </I18nextProvider>
        </EditorThemeProvider>
      </Provider>
    </StyledEngineProvider>
  </BrowserRouter>
);

export default EnhancedOutlineShortcutButton;
