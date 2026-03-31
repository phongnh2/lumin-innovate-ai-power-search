import { DocumentStorage } from 'constants/documentConstants';

import { useRestrictedUser } from './useRestrictedUser';

const useUploadOptions = () => {
  const { isDriveOnlyUser } = useRestrictedUser();

  return {
    [DocumentStorage.S3]: !isDriveOnlyUser,
    [DocumentStorage.GOOGLE]: true,
    [DocumentStorage.ONEDRIVE]: !isDriveOnlyUser,
    [DocumentStorage.DROPBOX]: !isDriveOnlyUser,
  };
};

export default useUploadOptions;
