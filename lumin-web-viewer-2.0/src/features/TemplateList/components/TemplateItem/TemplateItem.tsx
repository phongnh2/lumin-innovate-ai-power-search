import classNames from 'classnames';
import produce from 'immer';
import { Text, PlainTooltip, TextType, TextSize } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExtendedDocumentModalProps } from 'luminComponents/DocumentList/HOC/withDocumentModal';
import { DocumentThumbnail } from 'luminComponents/ReskinLayout/components/DocumentListItem/components';
import StopPropagation from 'luminComponents/StopPropagation';

import withDocumentItemAuthorization from 'HOC/withDocumentItemAuthorization';
import { withRightClickTemplate } from 'HOC/withRightClickTemplate';

import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';
import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';

import { dateUtil, getFileService } from 'utils';

import { useTemplateActions } from 'features/TemplateList/hooks';

import { REMOVE_UPLOAD_ICON_TIMEOUT } from 'constants/documentConstants';

import { DocumentTemplate, IDocumentBase } from 'interfaces/document/document.interface';

import TemplateMoreActionsButton from '../TemplateMoreActionsButton';

import styles from './TemplateItem.module.scss';

export interface TemplateItemProps {
  document: DocumentTemplate;
  refetchDocument: () => void;
  openDocumentModal: ExtendedDocumentModalProps['openDocumentModal'];
  containerScrollRef?: React.RefObject<HTMLElement | null>;
  updateDocumentInfo?: (document: IDocumentBase) => void;
}

const TemplateItem = (props: TemplateItemProps) => {
  const { document, openDocumentModal, updateDocumentInfo, containerScrollRef } = props;

  const { isPersonalTemplatePage } = useTemplatesPageMatch();
  const [isActivatedMoreActions, setIsActivatedMoreActions] = useState(false);
  const { t } = useTranslation();
  const { actions } = useTemplateActions({
    document,
    openDocumentModal,
  });
  const { onKeyDown } = useKeyboardAccessibility();

  const templateInterceptor = useMemo(
    () =>
      produce(document, (draftState) => {
        const lastModify: Date | number = !Number.isNaN(Number(draftState.lastModify))
          ? Number(draftState.lastModify)
          : new Date(draftState.lastModify);
        draftState.lastModify = dateUtil.formatMDYTime(lastModify);
      }),
    [document]
  );
  const { name, lastModify, thumbnail, ownerName, newUpload } = templateInterceptor;
  const templateName = name.substring(0, name.lastIndexOf('.')) || name;

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
    <div
      className={classNames(styles.container, {
        [styles.selected]: isActivatedMoreActions,
      })}
      data-personal-route={isPersonalTemplatePage}
      role="button"
      tabIndex={0}
      onClick={actions.previewTemplate}
      onKeyDown={onKeyDown}
    >
      <div className={styles.infoContainer}>
        <div className={styles.info}>
          <DocumentThumbnail
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            src={getFileService.getThumbnailUrl(thumbnail)}
            altText={templateName}
            isNewUpload={newUpload}
          />
          <PlainTooltip content={templateName}>
            <Text type="title" size="sm" ellipsis>
              {templateName}
            </Text>
          </PlainTooltip>
        </div>
      </div>
      {!isPersonalTemplatePage ? (
        <div>
          <Text type={TextType.body} size={TextSize.md} ellipsis color="var(--kiwi-colors-surface-on-surface-variant)">
            {ownerName}
          </Text>
        </div>
      ) : null}
      <div>
        <Text type={TextType.body} size={TextSize.md} ellipsis color="var(--kiwi-colors-surface-on-surface-variant)">
          {lastModify}
        </Text>
      </div>
      <PlainTooltip content={t('documentPage.moreActions')} disabled={isActivatedMoreActions}>
        <StopPropagation
          className={classNames(styles.moreActionWrapper, { [styles.activated]: isActivatedMoreActions })}
          data-button-more-id={document._id}
        >
          <TemplateMoreActionsButton
            actions={actions}
            document={document}
            containerScrollRef={containerScrollRef}
            onToggle={setIsActivatedMoreActions}
          />
        </StopPropagation>
      </PlainTooltip>
    </div>
  );
};

export default React.memo(withDocumentItemAuthorization(withRightClickTemplate(TemplateItem)));
