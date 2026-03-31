import { IconButton, Button, Icomoon, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';

import useExitFromViewer from '@new-ui/components/LuminTitleBar/components/TitleBarLeftSection/components/useExitFromViewer';

import useGetParentListUrl from 'luminComponents/HeaderLumin/hooks/useGetParentListUrl';
import useMatchPathLastLocation from 'luminComponents/HeaderLumin/hooks/useMatchPathLastLocation';

import { useTranslation } from 'hooks/useTranslation';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useIsOpenViewerNavigation, toggleViewerNavigation } from 'features/ViewerNavigation';

import styles from './NavigationHeader.module.scss';

const NavigationHeader = () => {
  const isViewerNavigationExpanded = useIsOpenViewerNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const backUrl = useGetParentListUrl();
  const lastLocationText = useMatchPathLastLocation(backUrl) as unknown as string;
  const { handleNavigateFromViewer } = useExitFromViewer({ backUrl });

  const toggle = () => {
    dispatch(toggleViewerNavigation());
  };

  return (
    <div className={styles.container} data-navigation-expanded={isViewerNavigationExpanded}>
      <div className={styles.innerContainer}>
        {isViewerNavigationExpanded ? (
          <>
            <Button
              data-lumin-btn-name={ButtonName.LUMIN_HOME_PAGE}
              variant="text"
              startIcon={<Icomoon type="arrow-narrow-left-md" />}
              onClick={handleNavigateFromViewer}
              classNames={{
                inner: styles.innerBackButton,
              }}
              data-cy="back_to_document_list"
            >
              <span className={styles.ellipsis}>{lastLocationText}</span>
            </Button>
            <PlainTooltip content={t('viewer.viewerNavigation.closeSidebar')}>
              <IconButton className={styles.closeButton} onClick={toggle} icon="x-md" />
            </PlainTooltip>
          </>
        ) : (
          <PlainTooltip content={t('viewer.viewerNavigation.openSidebar')}>
            <IconButton onClick={toggle} icon="hamburger-md" size="lg" data-cy="open_viewer_navigation" />
          </PlainTooltip>
        )}
      </div>
    </div>
  );
};

export default NavigationHeader;
