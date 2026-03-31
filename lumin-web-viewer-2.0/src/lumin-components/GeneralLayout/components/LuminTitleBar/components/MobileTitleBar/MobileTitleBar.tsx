import { ButtonSize, Button, IconButton, IconSize, Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import selectors from 'selectors';

import useGetParentListUrl from 'luminComponents/HeaderLumin/hooks/useGetParentListUrl';

import useGetMobileDeepLink from 'hooks/useGetMobileDeepLink';
import useShallowSelector from 'hooks/useShallowSelector';

import { isAndroidOrIOS } from 'helpers/device';

import { file as fileUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import useExitFromViewer from '../TitleBarLeftSection/components/useExitFromViewer';

import styles from './MobileTitleBar.module.scss';

const MobileTitleBar = ({ isNarrowScreen }: { isNarrowScreen: boolean }) => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { t } = useTranslation();
  const backUrl = useGetParentListUrl();
  const { handleNavigateFromViewer } = useExitFromViewer({ backUrl });
  const deepLink = useGetMobileDeepLink();
  const filenameWithoutExtension = fileUtils.getFilenameWithoutExtension(currentDocument?.name);

  const handleClickEditInApp = () => {
    window.open(deepLink);
  };

  return (
    <div className={styles.container}>
      <IconButton
        onClick={handleNavigateFromViewer}
        icon="arrow-narrow-left-md"
        size={ButtonSize.md}
        iconSize={IconSize.md}
        data-lumin-btn-name={ButtonName.LUMIN_HOME_PAGE}
      />
      <div className={styles.documentName}>{filenameWithoutExtension}</div>
      {isAndroidOrIOS && isNarrowScreen && (
        <Button
          startIcon={<Icomoon type="device-mobile-md" size={IconSize.md} />}
          onClick={handleClickEditInApp}
          data-lumin-btn-name={ButtonName.EDIT_IN_LUMIN_MOBILE_APP}
        >
          {t('viewer.titleBar.editInApp')}
        </Button>
      )}
    </div>
  );
};

export default MobileTitleBar;
