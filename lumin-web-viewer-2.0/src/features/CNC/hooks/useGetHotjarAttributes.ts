import { differenceInDays } from 'date-fns';
import { get } from 'lodash';
import { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import { useGetCurrentOrganization } from 'hooks';

import { commonUtils } from 'utils';

import { ORG_PLAN_TYPE } from 'constants/plan';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';
import { IUser } from 'interfaces/user/user.interface';

type Payload = {
  email_domain: string;
  user_account_created_at: number;
  days_since_account_created: number;
  workspace_size: number;
  user_personal_subscription_plan: string;
  user_personal_subscription_status: string;
  workspace_subscription_plan: string;
  workspace_subscription_status: string;
  is_user_a_member_of_a_trialing_or_paid_workspace: boolean;
  workspace_id: string;
  workspace_role: string;
  workspace_doc_stack_remaining: number;
};

const useGetHotjarAttributes = () => {
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const currentDocument = useSelector<unknown, IDocumentBase>(selectors.getCurrentDocument, shallowEqual);
  const currentOrganization =
    useGetCurrentOrganization() || (get(currentDocument, 'documentReference.data', '') as IOrganization);

  const { data: organizations } = useSelector<unknown, OrganizationList>(selectors.getOrganizationList, shallowEqual);
  const isUserMemberOfATrialingOrPaidWorkspace = organizations?.some(
    (org) => get(org, 'organization.payment.type', '') !== ORG_PLAN_TYPE.FREE
  );

  const { createdAt, payment: userPayment } = currentUser || {};
  const { type: userPlan, status: userPlanStatus } = userPayment || {};
  const email = get(currentUser, 'email', '');
  const workspaceRole = get(currentOrganization, 'userRole', '');

  const { totalMember, payment: organizationPayment } = currentOrganization || {};
  const { type: organizationPlan, status: organizationPlanStatus } = organizationPayment || {};
  const emailDomain = commonUtils.getDomainFromEmail(email);
  const userCreatedAtEpochSeconds = Math.floor(Date.parse(createdAt?.toString()) / 1000);
  const today = new Date(new Date().toISOString());
  const daysSinceAccountCreated = differenceInDays(today, new Date(createdAt));
  const workspaceId = get(currentOrganization, '_id', '');
  // Should be NaN if totalStack or totalUsed does not have value.
  const workspaceDocStackRemaining =
    get(currentOrganization, 'docStackStorage.totalStack', NaN) -
    get(currentOrganization, 'docStackStorage.totalUsed', NaN);

  return useMemo(
    (): Payload => ({
      email_domain: emailDomain,
      user_account_created_at: userCreatedAtEpochSeconds,
      days_since_account_created: daysSinceAccountCreated,
      workspace_size: totalMember,
      user_personal_subscription_plan: userPlan,
      user_personal_subscription_status: userPlanStatus,
      workspace_subscription_plan: organizationPlan,
      workspace_subscription_status: organizationPlanStatus,
      is_user_a_member_of_a_trialing_or_paid_workspace: isUserMemberOfATrialingOrPaidWorkspace,
      workspace_id: workspaceId,
      workspace_role: workspaceRole,
      workspace_doc_stack_remaining: workspaceDocStackRemaining,
    }),
    [
      emailDomain,
      userCreatedAtEpochSeconds,
      daysSinceAccountCreated,
      totalMember,
      userPlan,
      userPlanStatus,
      organizationPlan,
      organizationPlanStatus,
      isUserMemberOfATrialingOrPaidWorkspace,
      workspaceId,
      workspaceRole,
      workspaceDocStackRemaining,
    ]
  );
};

export { useGetHotjarAttributes };
