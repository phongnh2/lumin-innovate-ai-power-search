import { useMatch } from 'react-router-dom';

import { Routers } from 'constants/Routers';

const useJoinOrgsMatch = () => ({
  isJoinOrgsPage: Boolean(useMatch({ path: Routers.JOIN_YOUR_ORGANIZATIONS, end: false })),
});

export default useJoinOrgsMatch;
