import React, { useEffect } from 'react';
import { useMatch } from 'react-router-dom';

import core from 'core';

import { useDocumentSelectionStore } from 'luminComponents/Document/hooks/useDocumentSelectionStore';
import { useToggleRightSidebarButton } from 'luminComponents/RightSideBar/hooks/useToggleRightSidebarButton';

import { useConvertDocumentsToFiles } from 'hooks/useConvertDocumentsToFiles';
import useGetCurrentOrganization from 'hooks/useGetCurrentOrganization';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import useHomeMatch from 'hooks/useHomeMatch';

import { eventTracking } from 'utils/recordUtil';

import { APP_MARKETPLACE_SOURCES } from 'features/MiniApps/constants';
import InvoiceExtractorPanel from 'features/MiniApps/InvoiceExtractorPanel';
import ResumeCheckerPanel from 'features/MiniApps/ResumeCheckerPanel';
import TranslatorPanel from 'features/MiniApps/TranslatorPanel';
import { OnGetDocumentInstancesProps } from 'features/MiniApps/types';
import usePromoteTemplates from 'features/PromoteTemplates/hooks/usePromoteTemplates';
import WebChatBot from 'features/WebChatBot';
import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';
import useResetChatSession from 'features/WebChatBot/hooks/useResetChatSession';
import useShowWebChatbot from 'features/WebChatBot/hooks/useShowWebChatbot';

import UserEventConstants from 'constants/eventConstants';
import { ROUTE_MATCH } from 'constants/Routers';

import { RIGHT_PANEL_VALUES } from './constants';
import { useRightPanelStore } from './hooks/useRightPanelStore';

import styles from './WebRightPanel.module.scss';

export const WebRightPanel = () => {
  const currentUser = useGetCurrentUser();

  const { isHomePage } = useHomeMatch();
  const isDocumentOrg = Boolean(useMatch({ path: ROUTE_MATCH.ORG_DOCUMENT, end: false }));
  const isRouteMatchingRightPanel = isDocumentOrg || isHomePage;

  const { isVisible: isVisibleChatbot, setVisibleByDefault, setIsVisible } = useChatbotStore();
  const currentOrganization = useGetCurrentOrganization();
  const { isShowWebChatbot } = useShowWebChatbot();
  const { activePanel, setActivePanel } = useRightPanelStore();
  const { selectedDocuments } = useDocumentSelectionStore();
  const { isOpenPopover: isShowPromoteTemplatesPopover } = usePromoteTemplates();
  const { isInvoiceExtractorAppActived, isTranslatorAppActived, isResumeCheckerAppActived, onCloseViewerApp } =
    useToggleRightSidebarButton();
  const { convertDocumentsToFiles } = useConvertDocumentsToFiles();
  const shouldShowPanel =
    isVisibleChatbot || isInvoiceExtractorAppActived || isTranslatorAppActived || isResumeCheckerAppActived;

  const handleGetDocumentInstances = async ({ documentIds, abortSignal }: OnGetDocumentInstancesProps = {}): Promise<
    Core.Document[]
  > => {
    const documentsToConvert = documentIds?.length
      ? selectedDocuments.filter((doc) => documentIds.includes(doc._id))
      : selectedDocuments;

    const files = await convertDocumentsToFiles({ documents: documentsToConvert, abortSignal });
    return Promise.all(files.map((file) => core.CoreControls.createDocument(file)));
  };

  useResetChatSession();

  useEffect(() => {
    const shouldActiveChatbot = isVisibleChatbot && isRouteMatchingRightPanel;

    if (shouldActiveChatbot) {
      setActivePanel(RIGHT_PANEL_VALUES.CHATBOT);
      eventTracking(UserEventConstants.EventType.CHATBOT_OPENED).catch(() => {});
    }
  }, [isVisibleChatbot, isRouteMatchingRightPanel]);

  useEffect(() => {
    if (isShowPromoteTemplatesPopover) {
      setIsVisible(false);
      return;
    }

    if (!(isDocumentOrg || isHomePage) || !currentOrganization?._id || !isShowWebChatbot) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setVisibleByDefault();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    currentOrganization?._id,
    isDocumentOrg,
    isHomePage,
    isShowWebChatbot,
    setVisibleByDefault,
    setActivePanel,
    isShowPromoteTemplatesPopover,
    setIsVisible,
  ]);

  // case: change value of growth book feature flag
  useEffect(() => {
    if (!isShowWebChatbot) {
      setActivePanel(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowWebChatbot]);

  if (!isRouteMatchingRightPanel) {
    return null;
  }

  return (
    <div
      className={styles.rightPanelWrapper}
      data-show-panel={shouldShowPanel}
      data-is-document-route-match={isDocumentOrg}
      data-is-home-page={isHomePage}
    >
      <div className={styles.rightPanelContent} data-show={!!activePanel}>
        <div className={styles.contentContainer}>
          <div className={styles.panelWrapper}>
            {isVisibleChatbot && <WebChatBot />}
            {isInvoiceExtractorAppActived && (
              <InvoiceExtractorPanel
                userId={currentUser._id}
                documentViewer={null}
                source={APP_MARKETPLACE_SOURCES.DOCUMENT_LIST}
                selectedDocuments={selectedDocuments}
                onClose={onCloseViewerApp}
                onGetDocumentInstances={handleGetDocumentInstances}
              />
            )}
            {isTranslatorAppActived && (
              <TranslatorPanel
                documentViewer={null}
                selectedDocuments={selectedDocuments}
                source={APP_MARKETPLACE_SOURCES.DOCUMENT_LIST}
                onClose={onCloseViewerApp}
                onGetDocumentInstances={handleGetDocumentInstances}
              />
            )}
            {isResumeCheckerAppActived && (
              <ResumeCheckerPanel
                documentViewer={null}
                selectedDocuments={selectedDocuments}
                source={APP_MARKETPLACE_SOURCES.DOCUMENT_LIST}
                onClose={onCloseViewerApp}
                onGetDocumentInstances={handleGetDocumentInstances}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebRightPanel;
