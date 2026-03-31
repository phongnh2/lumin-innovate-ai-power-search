import { useEffect } from 'react';
import { v4 } from 'uuid';

import { useTrackingModalEvent } from 'hooks';

import organizationTracking from 'services/awsTracking/organizationTracking';

import { hotjarUtils } from 'utils';
import { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import organizationEvent from 'utils/Factory/EventCollection/OrganizationEventCollection';

import { ADD_USER_BULK_INVITE } from 'constants/awsEvents';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';

import { TrackModalSubmitProps } from '../InvitesToAddDocStackModal.types';

export function useTrackingInviteToAddDocStackEvent() {
  const { trackModalViewed, trackModalDismiss, trackModalConfirmation } = useTrackingModalEvent({
    modalName: ModalName.INVITE_TO_GET_FREE_DOC_STACK,
    modalPurpose: ModalPurpose[ModalName.INVITE_TO_GET_FREE_DOC_STACK],
  });

  function trackDocStackAdded(numberOfDocs: number) {
    organizationEvent
      .docStackAdded({
        trigger: ADD_USER_BULK_INVITE.INVITE_WHEN_HITTING_THREE_DOC_LIMIT,
        numberOfDocs,
      })
      .finally(() => {});
  }

  function trackOpenModal() {
    trackModalViewed().catch(() => {});
    hotjarUtils.trackEvent(HOTJAR_EVENT.MODAL_VIEWED_INVITE_TO_GET_FREE_DOC_STACK);
  }

  const trackModalSubmit = ({ numberOfDocs, members, invitations }: TrackModalSubmitProps) => {
    trackModalConfirmation().finally(() => {});
    trackDocStackAdded(numberOfDocs);

    if (members.length) {
      organizationTracking.trackAddUser({
        members,
        invitations,
        bulkInvite: ADD_USER_BULK_INVITE.INVITE_WHEN_HITTING_THREE_DOC_LIMIT,
        bulkInviteId: v4(),
      });
    }
  };

  useEffect(() => {
    trackOpenModal();
  }, []);

  return { trackModalSubmit, trackModalDismiss };
}
