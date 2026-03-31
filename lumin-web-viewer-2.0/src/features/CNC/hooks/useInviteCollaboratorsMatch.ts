import { useMatch } from 'react-router-dom';

import { Routers } from 'constants/Routers';

const useInviteCollaboratorsMatch = () => ({
  isInviteCollaboratorsPage: Boolean(useMatch({ path: Routers.INVITE_COLLABORATORS, end: false })),
});

export { useInviteCollaboratorsMatch };
