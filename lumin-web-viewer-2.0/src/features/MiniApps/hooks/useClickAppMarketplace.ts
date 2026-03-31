import { useToggleRightSideBarTool } from '@new-ui/components/LuminRightSideBar/hooks/useToggleRightSideBarTool';

import { useToggleRightSidebarButton } from 'luminComponents/RightSideBar/hooks/useToggleRightSidebarButton';

import { useMiniAppsStore } from './useMiniAppsStore';
import { APP_MARKETPLACE_SOURCES, MINIAPPS_LAYOUT_MAPPER } from '../constants';
import { AppMarketplaceSource } from '../types';

interface UseClickAppMarketplaceProps {
  source: AppMarketplaceSource;
}

export const useClickAppMarketplace = ({ source }: UseClickAppMarketplaceProps) => {
  const { setActiveApp } = useMiniAppsStore();
  const { onChangeLayout } = useToggleRightSideBarTool();
  const { onToggleViewerApps } = useToggleRightSidebarButton();

  const onClick = ({ appId, appName }: { appId: string; appName: string }) => {
    const appLayoutMapper = MINIAPPS_LAYOUT_MAPPER[appId as keyof typeof MINIAPPS_LAYOUT_MAPPER];
    const activeLayoutElement = appLayoutMapper[source as keyof typeof appLayoutMapper];

    setActiveApp({ appId, appName });

    switch (source) {
      case APP_MARKETPLACE_SOURCES.DOCUMENT_VIEWER: {
        onChangeLayout(activeLayoutElement);
        break;
      }
      case APP_MARKETPLACE_SOURCES.DOCUMENT_LIST: {
        onToggleViewerApps(activeLayoutElement);
        break;
      }
      default:
        break;
    }
  };

  return { onClick };
};
