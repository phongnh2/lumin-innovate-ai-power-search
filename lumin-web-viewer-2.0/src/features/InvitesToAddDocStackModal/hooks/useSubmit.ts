/* eslint-disable @typescript-eslint/no-floating-promises */
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useTranslation, useGetCurrentOrganization } from 'hooks';
import useGetOrganizationData from 'hooks/useGetOrganizationData';
import useUpdatesAvailableModal from 'hooks/useUpdatesAvailableModal';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';

import { ErrorCode } from 'constants/errorCode';
import { LOGGER } from 'constants/lumin-common';

import { UserPayload, TrackModalSubmitProps, User } from '../InvitesToAddDocStackModal.types';

type UseSubmitProps = {
  data: UserPayload[];
  onSuccess(): void;
  userList: User[];
  trackModalSubmit(payload: TrackModalSubmitProps): void;
};

const useSubmit = ({ data, userList, onSuccess, trackModalSubmit }: UseSubmitProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const organization = useGetOrganizationData();
  const currentOrganization = useGetCurrentOrganization();

  const { open: openUpdatesAvailableModal } = useUpdatesAvailableModal();

  const transformTrackingEventPayload = (invitations: TrackModalSubmitProps['invitations']) =>
    invitations.reduce((acc, cur) => {
      const _id = userList.find((user) => user.email === cur.memberEmail)?._id || '';
      const foundUser = data.find((user) => user.email === cur.memberEmail);
      if (foundUser) {
        acc.push({
          ...foundUser,
          _id,
        });
      }
      return acc;
    }, [] as TrackModalSubmitProps['members']);

  const handleSubmit = async () => {
    const orgId = organization._id;
    if (!orgId || !data.length) {
      return;
    }
    setIsSubmitting(true);
    try {
      const resp = await organizationServices.inviteMemberToAddDocStack({ orgId, members: data });

      const amount = resp.invitations.length > 10 ? 10 : resp.invitations.length;
      toastUtils.success({
        message: t('invitesToAddDocStackModal.successMessage', { amount }),
      });

      const payload = {
        docStackStorage: resp.organization.docStackStorage,
      };
      if (currentOrganization?._id === orgId) {
        dispatch(actions.updateCurrentOrganization(payload));
      }
      dispatch(actions.updateOrganizationInList(orgId, payload));

      trackModalSubmit({
        numberOfDocs: amount,
        members: transformTrackingEventPayload(resp.invitations),
        invitations: resp.invitations,
      });

      onSuccess();
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.INVITE_TO_ADD_DOCS_STACK,
        error: error as Error,
        message: 'Error submitting invite to add docs stack',
      });
      const { code, message } = errorUtils.extractGqlError(error) as { code: string; message: string };
      if (code === ErrorCode.Org.INVITE_ALREADY_USED) {
        openUpdatesAvailableModal();
        return;
      }
      if (errorUtils.handleScimBlockedError(error)) {
        return;
      }
      if (message) {
        toastUtils.error({ message });
        return;
      }
      toastUtils.openUnknownErrorToast();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
};

export default useSubmit;
