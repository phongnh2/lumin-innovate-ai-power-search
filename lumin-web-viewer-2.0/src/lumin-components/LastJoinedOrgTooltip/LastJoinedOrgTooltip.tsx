import { TooltipProps } from '@mui/material/Tooltip';
import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { ReactElement } from 'react';

import Tooltip from 'lumin-components/Shared/Tooltip';

import useGetCurrentOrganization from 'hooks/useGetCurrentOrganization';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { OrganizationUtilities } from 'utils/Factory/Organization';
import { UserUtilities } from 'utils/Factory/User';

type LastJoinedOrgTooltipProps = {
  title: string;
  placement?: TooltipProps['placement'];
  children: ReactElement;
  isReskin?: boolean;
  maxWidth?: number;
};

const LastJoinedOrgTooltip = ({
  title,
  placement = 'top',
  children,
  isReskin = false,
  maxWidth = 300,
}: LastJoinedOrgTooltipProps) => {
  const currentUser = useGetCurrentUser();
  const currentOrganization = useGetCurrentOrganization();

  const userUtilities = new UserUtilities({ user: currentUser });
  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization });

  const isPremiumUser = !userUtilities.isFree();

  if (!orgUtilities.isLastActiveOrg() || isPremiumUser) {
    return children;
  }

  if (isReskin) {
    return (
      <PlainTooltip position={placement} content={title} maw={maxWidth}>
        <div>{React.cloneElement(children, { disabled: true })}</div>
      </PlainTooltip>
    );
  }

  return (
    <Tooltip title={title} placement={placement}>
      <div>{React.cloneElement(children, { disabled: true })}</div>
    </Tooltip>
  );
};

export default LastJoinedOrgTooltip;
