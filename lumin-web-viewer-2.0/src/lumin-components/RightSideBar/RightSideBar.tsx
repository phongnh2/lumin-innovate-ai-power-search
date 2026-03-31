import classNames from 'classnames';
import { Divider, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import selectors from 'selectors';

import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';
import { useCleanup } from 'hooks/useCleanup';
import { useDesktopMatch } from 'hooks/useDesktopMatch';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useLatestRef } from 'hooks/useLatestRef';
import { useMiniAppTracking } from 'hooks/useMiniAppTracking';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { APP_MARKETPLACE_SOURCES } from 'features/MiniApps/constants';
import { useClickAppMarketplace } from 'features/MiniApps/hooks/useClickAppMarketplace';
import { useMiniAppsStore } from 'features/MiniApps/hooks/useMiniAppsStore';
import MarketplaceSection from 'features/MiniApps/MarketplaceSection';
import useShowWebChatbot from 'features/WebChatBot/hooks/useShowWebChatbot';
import { RIGHT_PANEL_VALUES } from 'features/WebRightPanel/constants';
import { useRightPanelStore } from 'features/WebRightPanel/hooks/useRightPanelStore';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { AskAIButton } from './components';
import { useXeroEvents } from './hooks/useXeroEvents';

import styles from './RightSideBar.module.scss';

function RightSideBar() {
  const currentUser = useGetCurrentUser();
  const isDesktopMatch = useDesktopMatch();
  const organization = useShallowSelector(selectors.getCurrentOrganization);
  useXeroEvents();

  const { isShowWebChatbot } = useShowWebChatbot();
  const { isOn: isAppMarketplace } = useGetFeatureIsOn({
    key: FeatureFlags.APP_MARKETPLACE,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });
  const isAppMarketplaceEnabled = isAppMarketplace && !process.env.DISABLE_APP_MARKETPLACE_MF;

  const { onClick: onClickAppMarketplace } = useClickAppMarketplace({
    source: APP_MARKETPLACE_SOURCES.DOCUMENT_LIST,
  });
  const { activePanel, setActivePanel } = useRightPanelStore();
  const { resetActiveApp } = useMiniAppsStore();

  const latestActivePanelRef = useLatestRef(activePanel);

  useMiniAppTracking();

  useCleanup(() => {
    const latestActivePanel = latestActivePanelRef.current;
    const shouldResetRightPanel = latestActivePanel !== RIGHT_PANEL_VALUES.CHATBOT;

    if (shouldResetRightPanel) {
      resetActiveApp();
      setActivePanel(null);
    }
  }, []);

  return (
    <div className={classNames(styles.wrapper, { [styles.nonDesktopWrapper]: !isDesktopMatch })}>
      {isShowWebChatbot && (
        <>
          <AskAIButton />
          <div className={styles.dividerWrapper}>
            <Divider />
          </div>
        </>
      )}
      <div className={styles.appsWrapper}>
        {isAppMarketplaceEnabled && (
          <>
            <MarketplaceSection
              targetPortal="#app"
              userId={currentUser._id}
              currentWorkspace={organization?.data}
              source={APP_MARKETPLACE_SOURCES.DOCUMENT_LIST}
              onClickApp={onClickAppMarketplace}
            />
            {/* TODO: Consider to remove this title in the future for syncing with document viewer */}
            <Text size="sm" type="label">
              Apps
            </Text>
          </>
        )}
      </div>
    </div>
  );
}

export default RightSideBar;
