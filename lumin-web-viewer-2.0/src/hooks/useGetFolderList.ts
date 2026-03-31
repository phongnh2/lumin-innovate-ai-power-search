import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

const useGetFolderList = () => {
  const { data } = useSelector(selectors.getFolderList, shallowEqual) || {};

  return data || [];
};

export default useGetFolderList;
