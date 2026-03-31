import { useDisclosure } from '@mantine/hooks';
import classNames from 'classnames';
import { Button, IconButton, Menu, MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { getShortcut } from '@new-ui/components/LuminToolbar/utils';

import ToolButtonTooltip from 'luminComponents/ViewerCommonV2/ToolButton/ToolButtonTooltip';

import { useTranslation } from 'hooks/useTranslation';

import { togglePresenterMode } from 'features/FullScreen/helpers/togglePresenterMode';

import { useAutoHidePresenterNavigation } from '../../hook/useAutoHidePresenterNavigation';
import { usePresentationHandlers } from '../../hook/usePresentationHandlers';
import PageIndication from '../PageIndication';

import styles from './PresenterModePageNavigation.module.scss';

const PresenterModePageNavigation = () => {
  const { t } = useTranslation();
  const [isSettingsMenuOpen, handlers] = useDisclosure(false);
  const { setToFitWidth, setToFitPage, resetZoom } = usePresentationHandlers();

  const { isVisible: isPresenterNavVisible } = useAutoHidePresenterNavigation();

  return (
    <div className={classNames(styles.container, { [styles.containerVisible]: isPresenterNavVisible })}>
      <div className={styles.wrapper}>
        <PageIndication isInPresenterMode />
        <hr className={styles.divider} />
        <Menu
          itemSize="dense"
          opened={isSettingsMenuOpen}
          onClose={handlers.close}
          withinPortal={false}
          ComponentTarget={
            <PlainTooltip disabled={isSettingsMenuOpen} content={t('viewer.presenterMode.settings')}>
              <IconButton data-hovered={isSettingsMenuOpen} icon="settings-md" onClick={handlers.toggle} />
            </PlainTooltip>
          }
        >
          <MenuItem leftIconProps={{ type: 'lm-fit-page' }} onClick={setToFitPage}>
            {t('action.fitToPage')}
          </MenuItem>
          <MenuItem leftIconProps={{ type: 'lm-fit-width' }} onClick={setToFitWidth}>
            {t('action.fitToWidth')}
          </MenuItem>

          <hr className={styles.menuDivider} />

          <MenuItem rightSection={getShortcut('fitHeight')} onClick={resetZoom}>
            {t('action.resetZoom')}
          </MenuItem>
        </Menu>

        <ToolButtonTooltip content={t('viewer.presenterMode.stopPresenterMode')} shortcut={getShortcut('fullScreen')}>
          <Button size="md" colorType="error" onClick={togglePresenterMode}>
            {t('action.stop')}
          </Button>
        </ToolButtonTooltip>
      </div>
    </div>
  );
};

export default PresenterModePageNavigation;
