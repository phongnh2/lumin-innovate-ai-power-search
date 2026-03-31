import React, { useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { InviteLinkContent, InviteLinkSwitch } from './components';
import useGetInviteLinkData from './hooks/useGetInviteLinkData';
import { setSelectedOrg } from './reducer/InviteLink.reducer';

import styles from './InviteLink.module.scss';

type InviteLinkProps = {
  organization?: IOrganization;
};

const InviteLink = ({ organization }: InviteLinkProps) => {
  const dispatch = useDispatch();

  const { inviteLink } = useGetInviteLinkData();

  useLayoutEffect(() => {
    dispatch(setSelectedOrg(organization));
  }, [organization]);

  return (
    <div className={styles.container} data-cy="invite_link_container">
      <div className={styles.layer} />
      <div className={styles.content}>{inviteLink ? <InviteLinkContent /> : <InviteLinkSwitch />}</div>
    </div>
  );
};

export default InviteLink;
