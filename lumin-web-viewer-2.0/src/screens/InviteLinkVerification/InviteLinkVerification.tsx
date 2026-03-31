/* eslint-disable @typescript-eslint/no-floating-promises */
import classNames from 'classnames';
import { Text, Button } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import FindSomethingImage from 'assets/reskin/images/find-something.png';

import actions from 'actions';

import LoadingComponent from 'lumin-components/AppCircularLoading';
import { LayoutSecondary, styles } from 'luminComponents/ReskinLayout/components/LayoutSecondary';

import { useTranslation, useGetCurrentUser } from 'hooks';

import { verifyOrganizationInviteLink } from 'services/graphServices/inviteLinkServices';

import { toastUtils } from 'utils';
import { JoinViaInviteLinkErrorType } from 'utils/Factory/EventCollection/constants/InviteLinkEvent';
import { InviteLinkEventCollection } from 'utils/Factory/EventCollection/InviteLinkEventCollection';
import { getTrendingUrl } from 'utils/orgUrlUtils';

import { Routers } from 'constants/Routers';

const InviteLinkVerification = () => {
  const { inviteLinkId } = useParams();
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();

  useEffect(() => {
    const verifyInviteLink = async () => {
      try {
        const res = await verifyOrganizationInviteLink(inviteLinkId);
        const inviteLinkEvents = new InviteLinkEventCollection({
          inviteLinkID: inviteLinkId,
          invitedRole: res.role,
          workspaceID: res.orgId,
        });
        inviteLinkEvents.accessInviteLink().catch(() => {});
        const redirectUrl = getTrendingUrl({ orgUrl: res.orgUrl });
        if (res.isAlreadyMember) {
          navigate(redirectUrl);
          inviteLinkEvents
            .joinViaInviteLinkError({ reason: JoinViaInviteLinkErrorType.ALREADY_BEING_MEMBER })
            .catch(() => {});
          return;
        }
        if (res.isExpired) {
          setHasError(true);
          inviteLinkEvents.joinViaInviteLinkError({ reason: JoinViaInviteLinkErrorType.LINK_EXPIRED }).catch(() => {});
          return;
        }
        inviteLinkEvents.joinViaInviteLinkSuccessfully().catch(() => {});
        toastUtils.success({ message: t('inviteLink.toastJoinOrgSuccess') });
        dispatch(actions.fetchOrganizations());
        if (!currentUser.hasJoinedOrg) {
          dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: res.orgUrl }));
        }
        navigate(redirectUrl);
      } catch (error) {
        setHasError(true);
        const inviteLinkEvents = new InviteLinkEventCollection({
          inviteLinkID: inviteLinkId,
        });
        inviteLinkEvents.accessInviteLink().catch(() => {});
        inviteLinkEvents.joinViaInviteLinkError({ reason: JoinViaInviteLinkErrorType.LINK_INVALID }).catch(() => {});
      }
    };
    verifyInviteLink();
  }, [inviteLinkId]);

  if (hasError) {
    return (
      <LayoutSecondary>
        <img src={FindSomethingImage} alt="find something" className={classNames(styles.image, styles.notFoundImage)} />
        <div>
          <Text type="headline" size="xl" className={styles.title}>
            {t('inviteLinkExpired.title')}
          </Text>
          <Text type="body" size="lg">
            {t('inviteLinkExpired.description')}
          </Text>
        </div>
        <div className={styles.buttonWrapper}>
          <Button onClick={() => navigate(Routers.ROOT, { replace: true })} size="lg">
            {t('documentNotFound.goToDocuments')}
          </Button>
        </div>
      </LayoutSecondary>
    );
  }

  return <LoadingComponent />;
};

export default InviteLinkVerification;
