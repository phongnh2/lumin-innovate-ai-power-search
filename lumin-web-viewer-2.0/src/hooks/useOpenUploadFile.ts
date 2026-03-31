import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useRestrictedUser } from './useRestrictedUser';

type OpenUploadFileDialog = {
  openUploadFileDialog: boolean;
  deleteSearchParams: () => void;
};

const useOpenUploadFile = (): OpenUploadFileDialog => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDriveOnlyUser } = useRestrictedUser();
  const openUploadFileDialog = useRef(
    (searchParams.has('openUploadFileDialog') && !isDriveOnlyUser) || searchParams.get('pop_over') === 'upload_a_pdf'
  );

  const deleteSearchParams = () => {
    searchParams.delete('pop_over');
    searchParams.delete('openUploadFileDialog');
    setSearchParams(searchParams);
  };

  return { openUploadFileDialog: openUploadFileDialog.current, deleteSearchParams };
};

export default useOpenUploadFile;
