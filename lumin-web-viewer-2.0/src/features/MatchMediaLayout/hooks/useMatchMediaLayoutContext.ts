import { useContext } from 'react';

import { MatchMediaLayoutContext } from '../contexts/MatchMediaLayout.context';

export const useMatchMediaLayoutContext = () => useContext(MatchMediaLayoutContext);
