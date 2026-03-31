import React from 'react';
import { useSelector } from 'react-redux';

import Divider from '@new-ui/general-components/Divider';

import selectors from 'selectors';

import { useDocumentExportPermission } from 'hooks/useDocumentExportPermission';
import { useMiniAppTracking } from 'hooks/useMiniAppTracking';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { useIntroChatBotButton } from 'features/AIChatBot/hooks/useIntroChatBotButton';
import { APP_MARKETPLACE_SOURCES } from 'features/MiniApps/constants';
import { useClickAppMarketplace } from 'features/MiniApps/hooks/useClickAppMarketplace';
import { useEnableAppMarketplace } from 'features/MiniApps/hooks/useEnableAppMarketplace';
import MarketplaceSection from 'features/MiniApps/MarketplaceSection';

import AiAssistantButton from './components/AiAssistantButton';
import CommentHistoryButton from './components/CommentHistoryButton';
import CopyLinkBtn from './components/CopyLinkBtn';
import DownloadBtn from './components/DownloadBtn';
import PrintBtn from './components/PrintBtn';
import SearchOverlayButton from './components/SearchOverlayButton';
import SignInRequiredProvider from './components/SignInRequiredProvider';
import SummarizeButton from './components/SummarizeButton';
import { useResetButtonState } from './hooks/useResetButtonState';
import { useShowNotesOption } from './hooks/useShowNotesOption';
import { useToggleRightSideBarTool } from './hooks/useToggleRightSideBarTool';

import styles from './RightSideBarContent.module.scss';

const RightSideBarContent = () => {
  const { t } = useTranslation();
  const currentUser = useSelector(selectors.getCurrentUser);
  const organization = useShallowSelector(selectors.getCurrentOrganization);
  const { isDisabledDownload, isDisabledPrint } = useDocumentExportPermission();
  const { onChangeLayout } = useToggleRightSideBarTool();
  useShowNotesOption();
  useIntroChatBotButton();
  useResetButtonState({ onChangeLayout });
  useMiniAppTracking();

  const { isAppMarketplaceEnabled } = useEnableAppMarketplace();

  const { onClick: onClickAppMarketplace } = useClickAppMarketplace({
    source: APP_MARKETPLACE_SOURCES.DOCUMENT_VIEWER,
  });

  return (
    <div className={styles.rightSideBarContent}>
      <AiAssistantButton />
      <SummarizeButton />
      <SearchOverlayButton />
      <CommentHistoryButton />
      <div className={styles.dividerWrapper}>
        <Divider />
      </div>
      <SignInRequiredProvider
        render={({ validate }) => (
          <>
            <DownloadBtn
              toolValidateCallback={validate}
              disabled={isDisabledDownload}
              tooltipContent={isDisabledDownload ? t('shareSettings.permissionDenied') : undefined}
            />
            <PrintBtn
              toolValidateCallback={validate}
              disabled={isDisabledPrint}
              tooltipContent={isDisabledPrint ? t('shareSettings.permissionDenied') : undefined}
            />
          </>
        )}
      />
      <CopyLinkBtn />
      {isAppMarketplaceEnabled && (
        <>
          <div className={styles.dividerWrapper}>
            <Divider />
          </div>
          <MarketplaceSection
            targetPortal="#app-container"
            userId={currentUser._id}
            currentWorkspace={organization?.data}
            source={APP_MARKETPLACE_SOURCES.DOCUMENT_VIEWER}
            onClickApp={onClickAppMarketplace}
          />
        </>
      )}
    </div>
  );
};

export default RightSideBarContent;
