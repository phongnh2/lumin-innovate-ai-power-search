import { useContext } from 'react';

import { HomeContext } from '../contexts';

export const useHomeContext = () => useContext(HomeContext);
