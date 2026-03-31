import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import { Nullable } from 'interfaces/common';
import { IFolder } from 'interfaces/folder/folder.interface';

const useGetCurrentFolder = (): Nullable<IFolder> =>
  useSelector<unknown, Nullable<IFolder>>(selectors.getCurrentFolder, shallowEqual);

export default useGetCurrentFolder;
