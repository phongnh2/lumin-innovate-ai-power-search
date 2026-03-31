import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

const useGetIsCompletedUploadDocuments = (): boolean =>
  useSelector<unknown, boolean>(selectors.getIsCompletedUploadDocuments, shallowEqual);

export default useGetIsCompletedUploadDocuments;
