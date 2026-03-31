import { useMatch } from 'react-router';

import { ORG_PATH } from 'constants/organizationConstants';

const useIsInOrgPage = (): boolean => Boolean(useMatch({ path: ORG_PATH, end: false }));

export default useIsInOrgPage;
