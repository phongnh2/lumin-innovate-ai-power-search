import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React, { useEffect } from 'react';

import { loadRemote } from 'services/moduleFederation';

import fireEvent from 'helpers/fireEvent';

import { socket } from '@socket';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { SOCKET_ON } from 'constants/socketConstant';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IUser } from 'interfaces/user/user.interface';

const XeroIntegrationAppComponent = createRemoteAppComponent({
  loader: () => loadRemote('appMarketplace/XeroIntegrationApp'),
  fallback: () => <div />,
  loading: null,
});

interface XeroIntegrationAppProps {
  currentUser: IUser;
  currentWorkspace: IOrganization;
}

const XeroIntegrationApp = ({
  currentUser,
  currentWorkspace,
  ...props
}: XeroIntegrationAppProps & React.ComponentProps<typeof XeroIntegrationAppComponent>) => {
  useEffect(() => {
    const notifyXeroApp = (data: {
      type: string;
      user_id: string;
      workspace_id: string;
      data: Record<string, unknown>;
    }) => {
      fireEvent(CUSTOM_EVENT.MINI_APP.XERO_INTEGRATION.NOTIFY_XERO_APP, data);
    };

    socket.on(SOCKET_ON.NOTIFY_XERO_APP, notifyXeroApp);
    return () => {
      socket.removeListener({ message: SOCKET_ON.NOTIFY_XERO_APP });
    };
  }, []);

  return (
    <XeroIntegrationAppComponent
      {...props}
      currentUser={currentUser}
      currentWorkspace={currentWorkspace}
      style={{
        overflow: 'hidden',
        height: '100%',
        backgroundColor: 'var(--kiwi-colors-surface-surface-container-low)',
      }}
    />
  );
};

export default XeroIntegrationApp;
