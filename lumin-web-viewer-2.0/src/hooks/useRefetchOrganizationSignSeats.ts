import { useEffect } from 'react';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { IOrganization } from 'interfaces/organization/organization.interface';

interface IAssignSignSeatsEvent {
  organization: IOrganization;
  assignSignSeatsData: {
    totalSignSeats: number;
    availableSignSeats: number;
  };
  assignedMember: {
    id: string;
    name: string;
  };
}

interface IUseRefetchOrganization {
  refetchList?: () => Promise<void>;
}

export default function useRefetchOrganizationSignSeats({ refetchList }: IUseRefetchOrganization) {
  const dispatch = useDispatch();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data;
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);

  useEffect(() => {
    const handleAssignSignSeats = (event: Event) => {
      const customEvent = event as CustomEvent<IAssignSignSeatsEvent>;
      const { organization, assignSignSeatsData } = customEvent.detail;

      if (organization) {
        const updatedOrgData = {
          ...currentOrganization,
          totalSignSeats: assignSignSeatsData.totalSignSeats,
          availableSignSeats: assignSignSeatsData.availableSignSeats,
          isSignProSeat: customEvent.detail.assignedMember.id === currentUser._id || currentOrganization.isSignProSeat,
        };

        batch(() => {
          dispatch(actions.updateCurrentOrganization(updatedOrgData));
          dispatch(actions.updateOrganizationInList(organization._id, updatedOrgData));
        });
      }
    };

    window.addEventListener(CUSTOM_EVENT.ASSIGN_SIGN_SEATS_SUCCESS, handleAssignSignSeats);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.ASSIGN_SIGN_SEATS_SUCCESS, handleAssignSignSeats);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleRefetchMembers = async () => {
      if (refetchList) {
        await refetchList();
      }
    };

    window.addEventListener(CUSTOM_EVENT.REFETCH_ORG_MEMBER, handleRefetchMembers);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.REFETCH_ORG_MEMBER, handleRefetchMembers);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
