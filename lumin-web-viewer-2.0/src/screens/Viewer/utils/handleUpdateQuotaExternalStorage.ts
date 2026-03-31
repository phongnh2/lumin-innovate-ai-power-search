import { store } from 'store';

import { dropboxServices, googleServices, oneDriveServices } from 'services';

import { setExternalQuotaSpace } from 'features/QuotaExternalStorage/slices';

import { STORAGE_TYPE } from 'constants/lumin-common';

const updateQuota = (total: number, used: number, remaining: number) => {
  store.dispatch(setExternalQuotaSpace({ total, used, remaining }));
};

const handleQuotaGoogleDrive = async () => {
  const quota = await googleServices.getUserSpaceInfo();
  const { usage, limit } = quota.storageQuota;
  const total = Number(limit);
  const remaining = total - Number(usage);
  const used = Number(usage);
  updateQuota(total, used, remaining);
};

const handleQuotaOneDrive = async () => {
  const quota = await oneDriveServices.getUserSpaceInfo();
  const { remaining, total } = quota;
  const used = total - remaining;
  updateQuota(total, used, remaining);
};

const handleQuotaDropbox = async () => {
  const quota = await dropboxServices.getUserSpaceInfo();
  const { used, allocation } = quota.data;
  const total = Number(allocation.allocated);
  const remaining = total - Number(used);
  updateQuota(total, used, remaining);
};

export const handleUpdateQuotaExternalStorage = async (service: typeof STORAGE_TYPE[keyof typeof STORAGE_TYPE]) => {
  switch (service) {
    case STORAGE_TYPE.GOOGLE:
      await handleQuotaGoogleDrive();
      break;
    case STORAGE_TYPE.ONEDRIVE:
      await handleQuotaOneDrive();
      break;
    case STORAGE_TYPE.DROPBOX:
      await handleQuotaDropbox();
      break;
    default:
      updateQuota(0, 0, 0);
      break;
  }
};
