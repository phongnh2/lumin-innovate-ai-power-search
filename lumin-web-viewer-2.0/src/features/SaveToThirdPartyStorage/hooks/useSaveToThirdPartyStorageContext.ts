import { useContext } from 'react';

import { SaveToThirdPartyStorageContext } from '../contexts/SaveToThirdPartyStorageContext';

export const useSaveToThirdPartyStorageContext = () => useContext(SaveToThirdPartyStorageContext);
