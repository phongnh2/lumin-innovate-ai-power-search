import classNames from 'classnames';
import { PlainTooltip } from 'lumin-ui/dist/kiwi-ui/Tooltip';
import React, { useEffect } from 'react';

import { ExtendedDocumentModalProps } from 'luminComponents/DocumentList/HOC/withDocumentModal';
import StopPropagation from 'luminComponents/StopPropagation';

import withRightClickDocument from 'HOC/withRightClickDocument';

import { useGetCurrentUser, useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import useDocumentActions from 'features/DocumentList/hooks/useDocumentActions';
import { DocumentActionsType } from 'features/DocumentList/types';
import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { REMOVE_UPLOAD_ICON_TIMEOUT } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';

import styles from './DocumentItem.module.scss';

type DocumentItemChildProps = {
  renderHiddenElement: (visibleElement: React.ReactNode, hiddenElement: React.ReactNode) => React.ReactNode;
  renderMoreActionsElement: (element: React.ReactNode) => React.ReactNode;
  actions: DocumentActionsType;
  isStarred: boolean;
};

type DocumentItemClassNames = {
  container?: string;
};

export interface DocumentItemProps {
  document: IDocumentBase;
  children: (props: DocumentItemChildProps) => React.ReactNode;
  refetchDocument: () => void;
  openDocumentModal: ExtendedDocumentModalProps['openDocumentModal'];
  containerScrollRef?: React.MutableRefObject<HTMLElement>;
  isActivatedMoreActions?: boolean;
  classNames?: DocumentItemClassNames;
  updateDocumentInfo?: (document: IDocumentBase) => void;
}

const DocumentItem = (props: DocumentItemProps) => {
  const {
    document,
    children,
    refetchDocument,
    openDocumentModal,
    isActivatedMoreActions,
    classNames: extraClassNames,
    updateDocumentInfo,
  } = props;
  const { isVisible } = useChatbotStore();
  const { t } = useTranslation();

  const { requestModalElement, actions } = useDocumentActions({
    document,
    refetchDocument,
    openDocumentModal,
  });
  const { onKeyDown } = useKeyboardAccessibility();

  const renderHiddenElement = (visibleElement: React.ReactNode, hiddenElement: React.ReactNode) => (
    <div
      className={styles.quickActionsWrapper}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div className={styles.visibleWrapper}>{visibleElement}</div>
      <div className={styles.hiddenWrapper}>{hiddenElement}</div>
    </div>
  );

  const renderMoreActionsElement = (element: React.ReactNode) => (
    <PlainTooltip content={t('documentPage.moreActions')} disabled={isActivatedMoreActions}>
      <StopPropagation
        role="presentation"
        className={classNames(styles.moreActionsWrapper, { [styles.activated]: isActivatedMoreActions })}
        data-button-more-id={document._id}
      >
        {element}
      </StopPropagation>
    </PlainTooltip>
  );

  const currentUser = useGetCurrentUser();

  const isStarred = document.listUserStar && document.listUserStar.includes(currentUser._id);

  // remove new upload dot
  useEffect(() => {
    const removeNewUploadDot = () => {
      if (document.newUpload && updateDocumentInfo) {
        const updatedDocument = { ...document, newUpload: false };
        updateDocumentInfo(updatedDocument);
      }
    };
    const timeout = setTimeout(() => {
      removeNewUploadDot();
    }, REMOVE_UPLOAD_ICON_TIMEOUT);
    return () => {
      clearTimeout(timeout);
    };
  }, [document, updateDocumentInfo]);

  return (
    <>
      <div
        data-cy="document_item"
        className={classNames(styles.container, extraClassNames?.container, {
          [styles.selected]: isActivatedMoreActions,
        })}
        role="button"
        tabIndex={0}
        onClick={actions.open}
        onKeyDown={onKeyDown}
        data-chatbot-opened={isVisible}
      >
        {children({ renderHiddenElement, renderMoreActionsElement, actions, isStarred })}
      </div>
      {requestModalElement}
    </>
  );
};

export default React.memo(withRightClickDocument<DocumentItemProps>(DocumentItem));
