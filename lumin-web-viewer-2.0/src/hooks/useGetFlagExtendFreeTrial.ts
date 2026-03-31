import { CNC_LOCAL_STORAGE_KEY } from 'features/CNC/constants/customConstant';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { IUserResult } from 'interfaces/user/user.interface';

import { useGetFeatureValue } from './growthBook/useGetFeatureValue';

export enum VARIANT_EXTEND_FREE_TRIAL {
  DISMISS_BY_MODAL = 'DISMISS_BY_MODAL',
  INVITE_LINK = 'INVITE_LINK',
  PREFILL_USERS = 'PREFILL_USERS',
}

const useGetFlagExtendFreeTrial = () => {
  const { value } = useGetFeatureValue<{ variant: VARIANT_EXTEND_FREE_TRIAL } | null>({
    key: FeatureFlags.MODAL_EXTRA_FREE_TRIAL_DAYS,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
    fallback: null,
  });

  const isPreFillUsers = value?.variant === VARIANT_EXTEND_FREE_TRIAL.PREFILL_USERS;
  const driveUsersCanInviteToWorkspace = JSON.parse(
    localStorage.getItem(CNC_LOCAL_STORAGE_KEY.DRIVE_COLLABORATORS_NOT_IN_CIRCLE) || '[]'
  ) as IUserResult[];
  const isValidVariant = Object.values(VARIANT_EXTEND_FREE_TRIAL).includes(value?.variant);

  const isInvitableUsers = driveUsersCanInviteToWorkspace.length > 0;
  const shouldShowModal = isValidVariant && !(isPreFillUsers && !isInvitableUsers);

  return {
    isShowExtendFreeTrialModal: shouldShowModal,
    variant: value?.variant,
  };
};

export default useGetFlagExtendFreeTrial;
