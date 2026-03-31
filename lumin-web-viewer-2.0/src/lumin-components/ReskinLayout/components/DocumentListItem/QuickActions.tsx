import { IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';

import { DocumentListContext } from 'luminComponents/DocumentList/Context';

import withDocumentItemAuthorization from 'HOC/withDocumentItemAuthorization';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { ObjectType, QuickAction as QuickActionEnum } from 'utils/Factory/EventCollection/constants/DocumentActionsEvent';
import docActionsEvent from 'utils/Factory/EventCollection/DocActionsEventCollection';

import { DocumentActions } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

interface QuickActionsProps {
  document: IDocumentBase;
  actions: {
    copyLink: (event: React.MouseEvent<HTMLButtonElement>) => void;
    share: (event: React.MouseEvent<HTMLButtonElement>) => void;
    makeACopy: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  withAuthorize: (action: string) => boolean;
  withPortalTooltip?: boolean;
  checkCapabilitiesDocumentPermission: (action: string) => boolean;
}

interface QuickActionsItem {
  icon: string;
  clickAction: (event: React.MouseEvent<HTMLButtonElement>) => void;
  precheckingRequired: boolean;
  expiredBlocking: boolean;
  tooltip: string;
  dataCy: string;
}

const QuickActions = (props: QuickActionsProps) => {
  const { t } = useTranslation();
  const { document, actions, withAuthorize, withPortalTooltip = false, checkCapabilitiesDocumentPermission } = props;
  const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
  const { externalDocumentExistenceGuard, onHandleDocumentOvertimeLimit } = useContext(DocumentListContext) || {};

  const quickActionsMapping = {
    [DocumentActions.MakeACopy]: {
      icon: 'copy-md',
      clickAction: (event: React.MouseEvent<HTMLButtonElement>) => {
        docActionsEvent
          .quickActions({
            object: ObjectType.DOC,
            action: QuickActionEnum.MAKE_A_COPY,
          })
          .catch(() => {});
        actions.makeACopy(event);
      },
      precheckingRequired: true,
      expiredBlocking: true,
      tooltip: t('modalMakeACopy.copyDocuments'),
      dataCy: 'quick_action_make_a_copy_button',
    },
    [DocumentActions.Share]: {
      icon: 'share-md',
      clickAction: (event: React.MouseEvent<HTMLButtonElement>) => {
        docActionsEvent
          .quickActions({
            object: ObjectType.DOC,
            action: QuickActionEnum.SHARE,
          })
          .catch(() => {});
        actions.share(event);
      },
      precheckingRequired: true,
      expiredBlocking: true,
      tooltip: t('common.share'),
      dataCy: 'quick_action_share_button',
    },
    [DocumentActions.CopyLink]: {
      icon: 'link-md',
      clickAction: (event: React.MouseEvent<HTMLButtonElement>) => {
        docActionsEvent
          .quickActions({
            object: ObjectType.DOC,
            action: QuickActionEnum.COPY_LINK,
          })
          .catch(() => {});
        actions.copyLink(event);
      },
      precheckingRequired: true,
      expiredBlocking: true,
      btnName: ButtonName.COPY_LINK,
      tooltip: t('documentPage.copyLink'),
      dataCy: 'quick_action_copy_link_button',
    },
  };

  const onItemClick = ({
    event,
    item,
    documentAction,
  }: {
    event: React.MouseEvent<HTMLButtonElement>;
    item: QuickActionsItem;
    documentAction: string;
  }) => {
    if (item.precheckingRequired) {
      externalDocumentExistenceGuard(document, () => item.clickAction(event), documentAction);
    } else {
      item.clickAction(event);
    }
  };

  const onClickItem = ({
    event,
    expiredBlocking,
    item,
    documentAction,
  }: {
    event: React.MouseEvent<HTMLButtonElement>;
    expiredBlocking: boolean;
    item: QuickActionsItem;
    documentAction: string;
  }) => {
    if (document.isOverTimeLimit && expiredBlocking) {
      onHandleDocumentOvertimeLimit(document);
    } else {
      onItemClick({ event, item, documentAction });
    }
  };

  const renderItem = (documentAction: string) => {
    const item = quickActionsMapping[documentAction];
    const { icon, tooltip = '', btnName = '', expiredBlocking = false, dataCy = '' } = item;

    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onClickItem({ event, expiredBlocking, item, documentAction });
    };
    const isNoHavePermissionToAction = !checkCapabilitiesDocumentPermission(documentAction);
    return (
      withAuthorize(documentAction) &&
      item && (
        <PlainTooltip
          withinPortal={withPortalTooltip}
          content={isNoHavePermissionToAction ? t('shareSettings.permissionDenied') : tooltip}
          style={{ whiteSpace: 'nowrap' }}
        >
          <IconButton
            icon={icon}
            size="md"
            data-button-share-id={document._id}
            onClick={onClick}
            data-cy={dataCy}
            data-lumin-btn-name={btnName}
            style={{ zIndex: 2 }}
            disabled={isNoHavePermissionToAction}
          />
        </PlainTooltip>
      )
    );
  };
  return (
    <>
      {renderItem(DocumentActions.MakeACopy)}
      {!isSystemFile && renderItem(DocumentActions.Share)}
      {renderItem(DocumentActions.CopyLink)}
    </>
  );
};

export default withDocumentItemAuthorization<QuickActionsProps>(QuickActions);
