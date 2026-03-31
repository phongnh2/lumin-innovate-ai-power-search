import React, { Dispatch } from 'react';
import { AnyAction } from 'redux';

import actions from 'actions';

import logger from 'helpers/logger';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import styles from 'features/CNC/CncComponents/JoinOrganizationFromOpenDrive/components/JoinedOrganizationModal.module.scss';

import { LOGGER, ModalTypes } from 'constants/lumin-common';

import { IOrganization } from 'interfaces/organization/organization.interface';

import JoinedOrganizationModal from '../CncComponents/JoinOrganizationFromOpenDrive/components/JoinedOrganizationModal';

const showJoinedOrganizationModal = ({
  organization,
  numberInvited = 0,
  dispatch,
}: {
  organization: IOrganization;
  numberInvited?: number;
  dispatch: Dispatch<AnyAction>;
}) => {
  const modalEventData = {
    modalName: ModalName.JOINED_ORGANIZATION,
    modalPurpose: ModalPurpose[ModalName.JOINED_ORGANIZATION],
  };

  dispatch(
    actions.openViewerModal({
      type: ModalTypes.TADA,
      title: null,
      message: React.createElement(JoinedOrganizationModal, { organization, numberInvited }),
      size: 'medium',
      footerVariant: null,
      PaperProps: {
        className: styles.paper,
      },
      closeOnRouteChange: false,
    }) as AnyAction
  );

  modalEvent
    .modalViewed(modalEventData)
    .catch((error: unknown) => logger.logError({ error, reason: LOGGER.Service.TRACK_EVENT_ERROR }));
};

export default showJoinedOrganizationModal;
