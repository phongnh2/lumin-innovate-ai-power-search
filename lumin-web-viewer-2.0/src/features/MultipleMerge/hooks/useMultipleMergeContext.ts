import { useContext } from 'react';

import { MultipleMergeContext } from '../contexts/MultipleMerge.context';

export const useMultipleMergeContext = () => useContext(MultipleMergeContext);
