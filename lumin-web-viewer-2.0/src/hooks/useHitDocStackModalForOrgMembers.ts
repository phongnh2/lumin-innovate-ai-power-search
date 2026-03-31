import { useNavigate } from 'react-router';

import { getHitDocStackModalContent } from 'utils/getHitDocStackModalContent';

import { HitDocStackModal } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

import { useTranslation } from './useTranslation';

interface Props {
  orgOfDoc: IOrganization;
}

export function useHitDocStackModalForOrgMembers({ orgOfDoc }: Props): HitDocStackModal {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userRole, payment, _id }: IOrganization = orgOfDoc || ({} as IOrganization);
  const trialInfo = payment?.trialInfo || {
    canStartTrial: false,
    canUseProTrial: false,
  };

  return getHitDocStackModalContent({
    t,
    userRole,
    navigate,
    payment,
    trialInfo,
    orgId: _id,
  });
}
