import { useContext } from 'react';

import { ContentCheckerContext } from '../contexts/ContentChecker.context';

export const useContentCheckerContext = () => useContext(ContentCheckerContext);
