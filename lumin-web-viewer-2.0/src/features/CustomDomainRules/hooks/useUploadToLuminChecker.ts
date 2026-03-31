import { useRestrictedUser } from 'hooks';

import { ERROR_MESSAGE_RESTRICTED_ACTION } from 'constants/messages';

export const useUploadToLuminChecker = (): {
  disabled: boolean;
  tooltipData?: { title: string };
} => {
  const { isDriveOnlyUser } = useRestrictedUser();

  return {
    disabled: isDriveOnlyUser,
    tooltipData: isDriveOnlyUser
      ? {
          title: ERROR_MESSAGE_RESTRICTED_ACTION,
        }
      : undefined,
  };
};
