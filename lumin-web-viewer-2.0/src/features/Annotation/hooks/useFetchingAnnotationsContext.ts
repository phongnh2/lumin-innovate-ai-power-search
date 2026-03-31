import { useContext } from 'react';

import { FetchingAnnotationsContext } from '../contexts';

export const useFetchingAnnotationsContext = () => useContext(FetchingAnnotationsContext);
