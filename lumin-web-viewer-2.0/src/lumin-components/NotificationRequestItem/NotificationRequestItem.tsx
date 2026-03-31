/* eslint-disable @typescript-eslint/ban-ts-comment */
import { produce } from 'immer';
import { Button } from 'lumin-ui/kiwi-ui';
import React, { SyntheticEvent, useContext, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';
import { RootState } from 'store';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import NotificationItemAvatar from 'lumin-components/NotificationItemAvatar';
import HeaderLuminContext from 'luminComponents/HeaderLumin/Context';
import { formatTime } from 'luminComponents/NotificationItem/utils';
import { useTrackingNotificationsEvent } from 'luminComponents/NotificationItemRenderer/hooks';
import NotiRequestItem from 'luminComponents/NotiRequestItem';

import { useEnableWebReskin, useHitDocStackModalForOrgMembers, useTransferFile, useTranslation } from 'hooks';
import useGetNotificationName from 'hooks/useGetNotificationName';

import { documentServices, organizationServices } from 'services';

import logger from 'helpers/logger';

import { dateUtil, string, toastUtils, errorUtils } from 'utils';

import { documentStorage } from 'constants/documentConstants';
import { ErrorCode } from 'constants/errorCode';
import { ModalTypes, STATUS_CODE } from 'constants/lumin-common';
import { ERROR_MESSAGE_UNKNOWN_ERROR, MESSAGE_OVER_FILE_SIZE, SUCCESS_MESSAGE } from 'constants/messages';
import { NotiType, NotificationTabs } from 'constants/notificationConstant';
import { ROUTE_MATCH } from 'constants/Routers';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { INotificationBase } from 'interfaces/notification/notification.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

import styles from '../NotificationItem/NotificationItem.module.scss';

import * as Styled from './NotificationRequestItem.styled';

const externalStorages = [documentStorage.google, documentStorage.dropbox, documentStorage.onedrive];

type Props = {
  handleClickNotification: (e: React.SyntheticEvent) => void;
  notification: INotificationBase;
};

const NotificationRequestItem = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { notification, handleClickNotification } = props;
  const { entity, notificationType, actor } = notification;
  const { organization: orgDestination } =
    useSelector<unknown, { organization: IOrganization }>(
      (state) => selectors.getOrganizationById(state as RootState, entity.entityData.ownOrgId as string),
      shallowEqual
    ) || {};
  const hitDocStackModalSettings = useHitDocStackModalForOrgMembers({ orgOfDoc: orgDestination });
  const contextValue = useContext(HeaderLuminContext) as { refetchDocument: () => void };
  const [loading, setLoading] = useState(false);
  const notificationName = useGetNotificationName(notification, NotificationTabs.REQUESTS);
  const elementRef = useRef(null);

  const { isEnableReskin } = useEnableWebReskin();

  const acceptWork = t('common.accept');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  useTrackingNotificationsEvent({ elementRef, notificationName });

  const { handleConfirmTransferFile } = useTransferFile({
    refetchDocument: contextValue?.refetchDocument,
  });

  const handleHitlimitDocstack = (): void => {
    if (!orgDestination) {
      dispatch(
        actions.openModal({
          type: isEnableReskin ? ModalTypes.HIT_DOC_STACK : ModalTypes.FIRE,
          title: t('modalHitDocstackSharedUser.title'),
          message: t('modalHitDocstackSharedUser.messageRequestAccess'),
          confirmButtonTitle: t('action.ok'),
          onConfirm: () => {},
          useReskinModal: true,
          confirmButtonProps: {
            withExpandedSpace: true,
          },
        })
      );
    } else {
      dispatch(actions.openModal(hitDocStackModalSettings));
    }
  };

  const handleAcceptRequestAccessDocument = async (): Promise<void> => {
    setLoading(true);
    try {
      await documentServices.acceptRequestAccessDocument({
        documentId: entity.id,
        requesterIds: [actor.id],
      });
      toastUtils.success({ message: t(SUCCESS_MESSAGE.APPROVE_REQUEST) }).finally(() => {});
    } catch (err) {
      const { code: errorCode } = errorUtils.extractGqlError(err) as { code: string };
      if (errorCode === ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT) {
        handleHitlimitDocstack();
      } else {
        toastUtils.openUnknownErrorToast().finally(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequestAccessOrg = async (e: SyntheticEvent): Promise<void> => {
    if (loading) return;
    setLoading(true);
    try {
      const acceptRequest = await organizationServices.acceptRequestingAccess({ orgId: entity.id, userId: actor.id });
      if (acceptRequest) {
        const { email } = acceptRequest.data;
        const orgDomain = entity.entityData.orgUrl as string;
        const url = `${ROUTE_MATCH.DASHBOARD_PEOPLE.replace(':orgDomain', orgDomain)}?searchInput=${encodeURIComponent(
          email
        )}`;
        window.open(url, '_blank');
      }
      handleClickNotification(e);
    } catch (err) {
      if (!errorUtils.handleScimBlockedError(err)) {
        toastUtils.openUnknownErrorToast().finally(() => {});
      }
      logger.logError({
        message: 'Error in accept NotificationRequestItem',
        error: err,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (currentDocument: IDocumentBase): Promise<void> => {
    setLoading(true);
    try {
      await handleConfirmTransferFile({ afterTransferCallback: handleAcceptRequestAccessDocument, currentDocument });
    } catch (err) {
      const error = errorUtils.extractGqlError(err);
      if (error.message === MESSAGE_OVER_FILE_SIZE) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const modalConfirmMoveToLumin = (currentDocument: IDocumentBase): void => {
    const modalSettings = {
      type: ModalTypes.INFO,
      title: t('modalShare.fileWillBeMovedToLuminStorage'),
      message: t('modalShare.messageFileWillBeMovedToLuminStorage'),
      confirmButtonTitle: acceptWork,
      onConfirm: () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handleAccept(currentDocument);
        dispatch(actions.closeModal());
      },
      onCancel: () => {},
    };
    dispatch(actions.openModal(modalSettings));
  };

  const beforeAccept = async (e: SyntheticEvent): Promise<void> => {
    e.stopPropagation();
    if (notificationType === NotiType.ORGANIZATION) {
      await handleAcceptRequestAccessOrg(e);
    } else {
      const currentDocument = await documentServices.getDocumentById(entity.id);
      const { service } = currentDocument;

      if (externalStorages.includes(service)) {
        modalConfirmMoveToLumin(currentDocument);
        return;
      }

      await handleAcceptRequestAccessDocument();
    }
  };

  const handleReject = async (e: SyntheticEvent): Promise<void> => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (notificationType === NotiType.ORGANIZATION) {
        const rejectRequest = await organizationServices.rejectRequestingAccess({
          orgId: entity.id,
          userId: actor.id,
        });
        if (rejectRequest.statusCode === STATUS_CODE.BAD_REQUEST) {
          toastUtils.error({ message: t(ERROR_MESSAGE_UNKNOWN_ERROR) }).finally(() => {});
        } else {
          toastUtils.success({ message: t(SUCCESS_MESSAGE.REJECT_REQUEST) }).finally(() => {});
        }
      } else {
        await documentServices.rejectRequestAccessDocument({
          documentId: entity.id,
          requesterIds: [actor.id],
        });
        toastUtils.success({ message: t(SUCCESS_MESSAGE.REJECT_REQUEST) }).finally(() => {});
      }
    } catch (err) {
      logger.logError({
        message: 'Error in reject NotificationRequestItem',
        error: err,
      });
      if (!errorUtils.handleScimBlockedError(err)) {
        toastUtils.openUnknownErrorToast().finally(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (): JSX.Element => {
    const noticationNameShorten = produce(notification, (draftState) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      draftState.actor.name = string.getShortenStringNotification(notification.actor.name);
      if (notification.entity) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        draftState.entity.name = string.getShortenStringNotification(notification.entity.name);
      }
      if (notification.target) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        draftState.target.targetName = string.getShortenStringNotification(notification.target.targetName);
      }
    });

    return <NotiRequestItem notification={noticationNameShorten} />;
  };

  if (isEnableReskin) {
    return (
      <div
        className={styles.container}
        onClick={handleClickNotification}
        ref={elementRef}
        role="presentation"
        data-cy="notification_request_item"
      >
        <div className={styles.avatarWrapper}>
          <NotificationItemAvatar notification={notification} />
        </div>
        <div className={styles.contentWrapper}>
          <div className={styles.content}>{renderContent()}</div>
          <div className={styles.bottomWrapper}>
            <div className={styles.timeAndProduct}>
              <div className={styles.time}>
                <span>{formatTime(notification)}</span>
              </div>
            </div>
            <div className={styles.actionsWrapper}>
              <Button
                variant="elevated"
                size="sm"
                onClick={handleReject}
                className={styles.rejectButton}
                data-cy="notification_request_reject_button"
              >
                {t('common.reject')}
              </Button>
              <Button
                size="sm"
                onClick={beforeAccept}
                className={styles.acceptButton}
                data-cy="notification_request_accept_button"
              >
                {acceptWork}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Styled.InviteItemContainer onClick={handleClickNotification} ref={elementRef}>
      <Styled.HeaderItem>
        <Styled.DateTime>
          <span>{dateUtil.formatFullDate(new Date(notification.createdAt))}</span>
        </Styled.DateTime>
      </Styled.HeaderItem>
      <Styled.Wrapper>
        <Styled.LeftContent>
          <NotificationItemAvatar notification={notification} />
        </Styled.LeftContent>
        <Styled.RightItem>
          <Styled.RightContent>{renderContent()}</Styled.RightContent>
          <Styled.ButtonContainer>
            {/* @ts-ignore */}
            <Styled.NotificationButton
              color={ButtonColor.TERTIARY}
              size={ButtonSize.XS}
              onClick={handleReject}
              disabled={loading}
            >
              {t('common.reject')}
            </Styled.NotificationButton>
            {/* @ts-ignore */}
            <Styled.NotificationButton size={ButtonSize.XS} onClick={beforeAccept} loading={loading}>
              {acceptWork}
            </Styled.NotificationButton>
          </Styled.ButtonContainer>
        </Styled.RightItem>
      </Styled.Wrapper>
    </Styled.InviteItemContainer>
  );
};

export default NotificationRequestItem;
