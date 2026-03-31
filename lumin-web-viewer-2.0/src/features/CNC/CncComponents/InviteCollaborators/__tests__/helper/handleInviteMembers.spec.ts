import actions from 'actions';
import { CTAEventValues, InviteActionTypes } from 'constants/featureFlagsConstant';
import { ORG_TEXT } from 'constants/organizationConstants';
import { mockOrganization as currentOrganization } from 'features/CNC/CncComponents/__mocks__/mockOrganization';
import { mockInviteToOrganizationInputs as baseMembers } from 'features/CNC/CncComponents/__mocks__/mockUser';
import { CNCModalName } from 'features/CNC/constants/events/modal';
import showContactCustomerSupportModal from 'features/CNC/helpers/showContactCustomerSupportModal';
import showJoinedOrganizationModal from 'features/CNC/helpers/showJoinedOrganizationModal';
import logger from 'helpers/logger';
import { organizationServices } from 'services';
import { errorUtils, toastUtils } from 'utils';

import { handleInviteMembers } from '../../helper/handleInviteMembers';

jest.mock('services', () => ({
  organizationServices: {
    inviteMemberToOrg: jest.fn(),
  },
}));

jest.mock('utils', () => ({
  errorUtils: {
    extractGqlError: jest.fn(),
    handleScimBlockedError: jest.fn(() => false),
  },
  toastUtils: {
    success: jest.fn(() => Promise.resolve()),
  },
  capitalize: jest.fn((str: string) => str),
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('features/CNC/helpers/showJoinedOrganizationModal', ()  => jest.fn());

jest.mock('features/CNC/helpers/showContactCustomerSupportModal', () => jest.fn());

jest.mock('actions', () => ({
  ...jest.requireActual('actions'),
  setShouldShowInviteCollaboratorsModal: jest.fn((value: boolean) => ({ type: 'SET', payload: value })),
}));

describe('handleInviteMembers', () => {
  let onSkip: jest.Mock;
  let dispatch: jest.Mock;
  let setIsSubmitting: jest.Mock;
  let navigate: jest.Mock;
  let t: jest.Mock;
  let getPromptGoogleUsersHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    onSkip = jest.fn();
    dispatch = jest.fn();
    setIsSubmitting = jest.fn();
    navigate = jest.fn();
    t = jest.fn((_key: string, opts?: any) => `invited ${opts?.numInvitation ?? 0}`);
    getPromptGoogleUsersHandler = jest.fn(() => Promise.resolve());

    (toastUtils.success as jest.Mock).mockImplementation(() => Promise.resolve());
    (organizationServices.inviteMemberToOrg as jest.Mock).mockImplementation(() => Promise.resolve());
  });

  it('invites members and navigates when not from collaborators modal', async () => {
    await handleInviteMembers({
      members: baseMembers,
      currentOrganization,
      onSkip,
      dispatch,
      setIsSubmitting,
      navigate,
      t,
      getPromptGoogleUsersHandler,
    });
    // Submission state
    expect(setIsSubmitting).toHaveBeenNthCalledWith(1, true);
    expect(setIsSubmitting).toHaveBeenLastCalledWith(false);

    // Service call with correct payload
    expect(organizationServices.inviteMemberToOrg).toHaveBeenCalledTimes(1);
    expect(organizationServices.inviteMemberToOrg).toHaveBeenCalledWith({
      orgId: currentOrganization._id,
      members: baseMembers,
      invitedFrom: CTAEventValues[InviteActionTypes.JOIN_ORGANIZATION_FROM_OPEN_DRIVE],
    });

    // Navigation
    expect(navigate).toHaveBeenCalledWith(`/${ORG_TEXT}/${currentOrganization.url}/documents/personal`, { replace: true });

    // Finally block behavior
    expect(onSkip).toHaveBeenCalledWith({ replace: false });
    expect(toastUtils.success).toHaveBeenCalledWith({
      message: `invited ${baseMembers.length}`,
      useReskinToast: true,
    });
    expect(showJoinedOrganizationModal).toHaveBeenCalledWith({
      organization: currentOrganization,
      numberInvited: baseMembers.length,
      dispatch,
    });
    // No collaborators modal handling
    expect(dispatch).not.toHaveBeenCalledWith({ type: 'SET', payload: false });
    expect(showContactCustomerSupportModal).not.toHaveBeenCalled();
    // Prompt handler
    expect(getPromptGoogleUsersHandler).toHaveBeenCalledWith({ orgId: currentOrganization._id, forceUpdate: true });
  });

  it('does not navigate and dispatches close when from collaborators modal; opens contact support if flag set', async () => {
    await handleInviteMembers({
      members: baseMembers,
      currentOrganization,
      onSkip,
      dispatch,
      setIsSubmitting,
      navigate,
      t,
      from: CNCModalName.INVITE_MEMBER_TO_WORKSPACE,
      getPromptGoogleUsersHandler,
      shouldOpenContactCustomerSupportModal: true,
    });

    // Service call uses collaborators modal origin
    expect(organizationServices.inviteMemberToOrg).toHaveBeenCalledWith({
      orgId: currentOrganization._id,
      members: baseMembers,
      invitedFrom: CTAEventValues[InviteActionTypes.INVITE_COLLABORATORS_MODAL],
    });

    // No navigation when from collaborators modal
    expect(navigate).not.toHaveBeenCalled();

    // Closes collaborators modal
    expect(actions.setShouldShowInviteCollaboratorsModal).toHaveBeenCalledWith(false);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET', payload: false });

    // Contact support modal shown
    expect(showContactCustomerSupportModal).toHaveBeenCalledWith({ numberInvited: baseMembers.length });

    // Shared finally behaviors
    expect(onSkip).toHaveBeenCalledWith({ replace: false });
    expect(toastUtils.success).toHaveBeenCalled();
    expect(showJoinedOrganizationModal).toHaveBeenCalled();
    expect(getPromptGoogleUsersHandler).toHaveBeenCalledWith({ orgId: currentOrganization._id, forceUpdate: true });
  });

  it('handles errors by logging and still runs finally block', async () => {
    const boom = new Error('Boom');
    (organizationServices.inviteMemberToOrg as jest.Mock).mockRejectedValueOnce(boom);
    (errorUtils.extractGqlError as jest.Mock).mockReturnValueOnce({ message: 'graph error' });

    await handleInviteMembers({
      members: baseMembers,
      currentOrganization,
      onSkip,
      dispatch,
      setIsSubmitting,
      navigate,
      t,
      from: '',
      getPromptGoogleUsersHandler,
      shouldOpenContactCustomerSupportModal: false,
    });

    // Error extraction and logging
    expect(errorUtils.extractGqlError).toHaveBeenCalledWith(boom);
    expect(logger.logError).toHaveBeenCalledWith({ message: 'graph error', error: boom });

    // Since error occurred before navigate in try, no navigation
    expect(navigate).not.toHaveBeenCalled();

    // Finally still runs
    expect(setIsSubmitting).toHaveBeenLastCalledWith(false);
    expect(onSkip).toHaveBeenCalledWith({ replace: false });
    expect(toastUtils.success).toHaveBeenCalled();
    expect(showJoinedOrganizationModal).toHaveBeenCalled();
    expect(getPromptGoogleUsersHandler).toHaveBeenCalledWith({ orgId: currentOrganization._id, forceUpdate: true });
  });

  it('skips service call when no members but still navigates (non-collaborators path)', async () => {
    await handleInviteMembers({
      members: [],
      currentOrganization,
      onSkip,
      dispatch,
      setIsSubmitting,
      navigate,
      t,
      getPromptGoogleUsersHandler,
    });

    expect(organizationServices.inviteMemberToOrg).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(`/${ORG_TEXT}/${currentOrganization.url}/documents/personal`, { replace: true });
    expect(toastUtils.success).toHaveBeenCalledWith({
      message: 'invited 0',
      useReskinToast: true,
    });
  });

  it('covers catch handlers by forcing failures of toast and prompt handler', async () => {
  // Ensure the service call resolves so we hit the finally block.
  (organizationServices.inviteMemberToOrg as jest.Mock).mockResolvedValueOnce(undefined);

  // Force toastUtils.success to reject once.
  (toastUtils.success as jest.Mock).mockRejectedValueOnce(new Error('toast failed'));

  // Pass a getPromptGoogleUsersHandler that rejects once.
  const getPromptGoogleUsersHandler = jest.fn().mockRejectedValueOnce(new Error('prompt failed'));
  await handleInviteMembers({
    members: baseMembers,
    currentOrganization,
    onSkip: jest.fn(),
    dispatch: jest.fn(),
    setIsSubmitting: jest.fn(),
    navigate: jest.fn(),
    t: ((key: string) => key) as any,
    getPromptGoogleUsersHandler,
  });

  // Let microtasks from the rejected promises settle
  await Promise.resolve();

  expect(toastUtils.success).toHaveBeenCalled();
  expect(getPromptGoogleUsersHandler).toHaveBeenCalledWith({ orgId: currentOrganization._id, forceUpdate: true });
});
});
