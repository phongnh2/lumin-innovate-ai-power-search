/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import classNames from 'classnames';
import { Checkbox, Chip, TextSize, TextType, PlainTooltip, ButtonSize } from 'lumin-ui/kiwi-ui';
import React, { useContext, useMemo, useState } from 'react';

import { DocumentListRendererContext } from 'luminComponents/DocumentList/Context';
import StopPropagation from 'luminComponents/StopPropagation';
import SvgElement from 'luminComponents/SvgElement';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useDoubleTap, useTranslation, usePersonalDocPathMatch } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { getFileService } from 'utils';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { TextField, DocumentThumbnail } from './components';
import { DocumentName } from './components/DocumentName';
import { DocumentItemStar } from '../DocumentItemStar';

import styles from './DocumentListItem.module.scss';

type DocumentListItemProps = {
  document: IDocumentBase & { newUpload?: boolean };
  isSelected: boolean;
  isDisabled: {
    selection: boolean;
    actions: boolean;
    open?: boolean;
    drag: boolean;
  };
  storageLogo: string;
  isStarred: boolean;
  dragRef: React.MutableRefObject<HTMLDivElement>;
  onCheckboxChange: () => void;
  onOpenDocument: () => void;
  renderMenuActions?: ({
    openMenu,
    setOpenMenu,
  }: {
    openMenu: boolean;
    setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
  onShareItemClick: () => void;
  onCopyShareLink: () => void;
  renderQuickActions: () => React.ReactNode;
  foundDocumentScrolling: boolean;
};

const DocumentListItem = (props: DocumentListItemProps) => {
  const {
    document,
    storageLogo,
    isSelected,
    isDisabled,
    onOpenDocument,
    onCheckboxChange,
    isStarred,
    dragRef,
    renderMenuActions,
    renderQuickActions,
    foundDocumentScrolling,
  } = props;
  const { t } = useTranslation();
  const { isVisible } = useChatbotStore();

  const { name, lastAccess, thumbnail, ownerName, newUpload, isOverTimeLimit, highlightFoundDocument } = document;

  const { folderDraggingOver } = useContext(withDropDocPopup.DropDocumentPopupContext);

  const { selectDocMode } = useContext(DocumentListRendererContext);

  const isPersonalDocumentsRoute = usePersonalDocPathMatch();

  const [openMenu, setOpenMenu] = useState(false);

  const documentName = name.substring(0, name.lastIndexOf('.')) || name;

  const handleTouchEnd = useDoubleTap(onOpenDocument);

  const { onKeyDown } = useKeyboardAccessibility();

  const handleOpenDocument = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const elementMore = target.closest(`[data-button-more-id="${document._id}"]`);
    const elementStar = target.closest(`[data-button-star-id="${document._id}"]`);
    const elementShare = target.closest(`[data-button-connections-id="${document._id}"]`);
    const elementLink = target.closest(`[data-button-share-id="${document._id}"]`);
    const menuItem = target.closest(`[data-menu-item="true"]`);
    if (!elementMore && !elementStar && !elementShare && !elementLink && !menuItem) {
      onOpenDocument();
    }
  };

  const containerClassName = useMemo(
    () =>
      classNames(styles.container, {
        [styles.disabled]: Boolean(folderDraggingOver),
        [styles.disabledSelection]: isDisabled.selection,
      }),
    [folderDraggingOver, isDisabled.selection]
  );

  const thumbnailSrc = useMemo(() => getFileService.getThumbnailUrl(thumbnail), [thumbnail]);

  return (
    <div className={containerClassName}>
      <div className={classNames(styles.checkboxWrapper, selectDocMode && styles.displayCheckbox)}>
        <Checkbox
          size="sm"
          borderColor="var(--kiwi-colors-surface-outline)"
          checked={isSelected}
          onChange={onCheckboxChange}
          disabled={isDisabled.selection}
        />
      </div>
      <div
        ref={dragRef}
        role="button"
        tabIndex={0}
        data-cy="document_item"
        data-chatbot-opened={isVisible}
        className={classNames(
          styles.wrapper,
          isPersonalDocumentsRoute ? styles.wrapperWithoutOwnerName : styles.wrapperWithOwnerName,
          isSelected && styles.selected,
          selectDocMode && styles.onSelectMode,
          { [styles.highlightFoundDocument]: !foundDocumentScrolling && highlightFoundDocument }
        )}
        onDoubleClick={handleOpenDocument}
        onTouchEnd={handleTouchEnd}
        onClick={handleOpenDocument}
        onKeyDown={onKeyDown}
      >
        <div className={styles.infoContainer}>
          <DocumentThumbnail src={thumbnailSrc} altText={documentName} isNewUpload={newUpload} />
          <div className={styles.commonInfo}>
            <div className={styles.documentNameWrapper}>
              <DocumentName name={documentName} disabled={isDisabled.selection || isDisabled.drag} />
            </div>
            <div
              className={classNames({
                [styles.documentStatusWrapper]: isOverTimeLimit,
                [styles.documentStatusWrapperWithoutOwnerName]: isOverTimeLimit && isPersonalDocumentsRoute,
              })}
            >
              {isOverTimeLimit && <Chip label={t('documentPage.expired')} variant="light" size="sm" colorType="grey" />}
              <div className={styles.starWrapper} data-has-column-owner={!isPersonalDocumentsRoute}>
                <DocumentItemStar
                  document={document}
                  isStarred={isStarred}
                  disabled={isDisabled.actions}
                  size={ButtonSize.sm}
                />
              </div>
            </div>
          </div>
        </div>
        {isPersonalDocumentsRoute ? null : (
          <div className={styles.ownerName}>
            <TextField
              value={ownerName}
              type={TextType.body}
              size={TextSize.md}
              tooltip
              color="var(--kiwi-colors-surface-on-surface-variant)"
              component="span"
            />
          </div>
        )}
        {storageLogo && (
          <div className={styles.storage}>
            <SvgElement content={storageLogo} height={24} maxWidth={24} isReskin />
          </div>
        )}
        <div className={styles.lastAccess}>
          <TextField
            value={lastAccess}
            type={TextType.body}
            size={TextSize.md}
            color="var(--kiwi-colors-surface-on-surface-variant)"
          />
        </div>
        <div className={styles.actionsContainer}>{renderQuickActions()}</div>
        <PlainTooltip content={t('documentPage.moreActions')} disabled={openMenu}>
          <StopPropagation
            role="presentation"
            className={classNames(styles.more, openMenu && styles.openMenu)}
            data-button-more-id={document._id}
          >
            {renderMenuActions({ openMenu, setOpenMenu })}
          </StopPropagation>
        </PlainTooltip>
      </div>
    </div>
  );
};

export default DocumentListItem;
