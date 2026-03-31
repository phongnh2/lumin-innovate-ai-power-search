import { useDisclosure } from '@mantine/hooks';
import classNames from 'classnames';
import { Button, IconButton, Menu, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import ShareItem from 'luminComponents/HeaderLumin/components/ShareItem';
import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { useDocumentPermission } from 'hooks/useDocumentPermission';
import useDocumentTools from 'hooks/useDocumentTools';
import { useIntegrate } from 'hooks/useIntegrate';
import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';
import { useShallowSelector } from 'hooks/useShallowSelector';

import UserEventConstants from 'constants/eventConstants';
import { INTEGRATE_BUTTON_NAME } from 'constants/luminSign';

import styles from './ShareButton.module.scss';

interface IProps {
  tooltip: {
    title: string;
  };
  shareTitle: string;
  isOffline: boolean;
  icon: string;
}

export default function ShareButton({ tooltip, shareTitle, isOffline, icon }: IProps) {
  const { t } = useTranslation();
  const [isOpen, { toggle, close }] = useDisclosure(false);
  const { handleEvent } = useIntegrate();
  const { handleShareDocument } = useDocumentTools();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { canShare } = useDocumentPermission(currentDocument);
  const { requestAccessModalElement, withSharePermission } = useRequestPermissionChecker({
    permissionRequest: RequestType.SHARER,
  });
  const shareButtonRef = useRef<HTMLDivElement>(null);

  const onClick = () => {
    if (!isOpen) {
      handleEvent(INTEGRATE_BUTTON_NAME.SHARE);
    }
    toggle();
  };

  return (
    <>
      {!canShare && requestAccessModalElement}
      <div className={styles.buttonGroup} ref={shareButtonRef}>
        <PlainTooltip disabled={isOpen} content={tooltip.title}>
          <Button
            className={classNames('share', styles.buttonShare)}
            disabled={isOffline}
            onClick={withSharePermission(() => handleShareDocument({ inRightSideBar: false }))}
            startIcon={<Icomoon className={icon} size={24} />}
            size="lg"
            variant="tonal"
            data-lumin-btn-name={UserEventConstants.Events.HeaderButtonsEvent.SHARE}
          >
            {shareTitle}
          </Button>
        </PlainTooltip>
        <Menu
          onClose={close}
          opened={isOpen}
          position="bottom-end"
          closeOnItemClick
          closeOnClickOutside
          itemSize="dense"
          ComponentTarget={
            <PlainTooltip disabled={isOpen} content={t('viewer.shareButton.moreOptions')}>
              <IconButton
                className={classNames('dropdown', styles.dropdown)}
                onClick={onClick}
                disabled={isOffline}
                icon={<Icomoon className="md_arrow_down" size={24} />}
                size="lg"
                variant="tonal"
              />
            </PlainTooltip>
          }
        >
          <ShareItem withSharePermission={withSharePermission} open={isOpen} />
        </Menu>
      </div>
    </>
  );
}
