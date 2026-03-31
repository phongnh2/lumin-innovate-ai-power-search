import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';

import LuminNoteHistoryPanel from '@new-ui/components/LuminNoteHistoryPanel';
import { LayoutElements } from '@new-ui/constants';

import core from 'core';
import selectors from 'selectors';

import DocumentSummarization from 'luminComponents/DocumentSummarization/DocumentSummarization';

import fireEvent from 'helpers/fireEvent';

import fileUtils from 'utils/file';
import { lazyWithRetry } from 'utils/lazyWithRetry';

/**
 * FIXME: Create lazy import for EditorChatBot
 */
import EditorChatBot from 'features/EditorChatBot';
import { useCheckDocumentChange } from 'features/EditorChatBot/hooks/useCheckDocumentChange';
import { APP_MARKETPLACE_SOURCES } from 'features/MiniApps/constants';
import { useEnableAppMarketplace } from 'features/MiniApps/hooks/useEnableAppMarketplace';
import InvoiceExtractorPanel from 'features/MiniApps/InvoiceExtractorPanel';
import ResumeCheckerPanel from 'features/MiniApps/ResumeCheckerPanel';
import TranslatorPanel from 'features/MiniApps/TranslatorPanel';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { useShortkeyToggleChatbot } from './useShortkeyToggleChatbot';
import { ContentContainer, PanelWrapper } from '../../LuminRightPanel.styled';

const LuminSearchPanel = lazyWithRetry(() => import('../LuminSearchPanel'));

const LuminRightPanel = ({ isRightPanelOpen = false, rightPanelValue = LayoutElements.DEFAULT }) => {
  const totalPages = useSelector(selectors.getTotalPages);
  const currentUser = useSelector(selectors.getCurrentUser);
  const currentDocument = useSelector(selectors.getCurrentDocument);

  const isSearchPanelOpen = rightPanelValue === LayoutElements.SEARCH && isRightPanelOpen;
  const isNoteHistoryPanelOpen = rightPanelValue === LayoutElements.NOTE_HISTORY && isRightPanelOpen;
  const isDocumentSummarizationOpen = rightPanelValue === LayoutElements.SUMMARIZATION && isRightPanelOpen;
  const isChatBotOpen = rightPanelValue === LayoutElements.CHATBOT && isRightPanelOpen;
  const isTranslatorOpen = rightPanelValue === LayoutElements.TRANSLATOR && isRightPanelOpen;
  const isInvoiceExtractorOpen = rightPanelValue === LayoutElements.INVOICE_EXTRACTOR && isRightPanelOpen;
  const isResumeCheckerOpen = rightPanelValue === LayoutElements.RESUME_CHECKER && isRightPanelOpen;

  useShortkeyToggleChatbot();
  useCheckDocumentChange();
  const { isAppMarketplaceEnabled } = useEnableAppMarketplace();

  return (
    <ContentContainer $isSummarization={isDocumentSummarizationOpen}>
      <PanelWrapper>
        {isSearchPanelOpen && <LuminSearchPanel />}
        {isDocumentSummarizationOpen && <DocumentSummarization />}
        {isChatBotOpen && <EditorChatBot />}
        <LuminNoteHistoryPanel isNoteHistoryPanelOpen={isNoteHistoryPanelOpen} />
        {isAppMarketplaceEnabled && (
          <>
            {isTranslatorOpen && (
              <TranslatorPanel
                documentViewer={core.docViewer}
                source={APP_MARKETPLACE_SOURCES.DOCUMENT_VIEWER}
                onClose={() =>
                  fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
                    elementName: LayoutElements.TRANSLATOR,
                    isOpen: false,
                  })
                }
                documentId={currentDocument._id}
                documentName={fileUtils.getFilenameWithoutExtension(currentDocument.name)}
              />
            )}
            {isInvoiceExtractorOpen && (
              <InvoiceExtractorPanel
                userId={currentUser._id}
                documentId={currentDocument._id}
                totalPages={totalPages}
                source={APP_MARKETPLACE_SOURCES.DOCUMENT_VIEWER}
                onClose={() =>
                  fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
                    elementName: LayoutElements.INVOICE_EXTRACTOR,
                    isOpen: false,
                  })
                }
                documentViewer={core.docViewer}
              />
            )}
            {isResumeCheckerOpen && (
              <ResumeCheckerPanel
                documentId={currentDocument._id}
                documentViewer={core.docViewer}
                source={APP_MARKETPLACE_SOURCES.DOCUMENT_VIEWER}
                onClose={() =>
                  fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
                    elementName: LayoutElements.RESUME_CHECKER,
                    isOpen: false,
                  })
                }
              />
            )}
          </>
        )}
      </PanelWrapper>
    </ContentContainer>
  );
};

LuminRightPanel.propTypes = {
  isRightPanelOpen: PropTypes.bool,
  rightPanelValue: PropTypes.string,
};

export default LuminRightPanel;
