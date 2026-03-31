import { useState } from 'react';

import { OAuth2Client } from 'features/DeveloperApi/interfaces';

import { useFetchingOAuthClients } from './useFetchingOAuthClients';

type AppScreenState = { type: 'default' } | { type: 'creator' } | { type: 'editting'; payload: Partial<OAuth2Client> };

export const useApiAppsHandler = () => {
  const [appScreenState, setAppScreenState] = useState<AppScreenState>({ type: 'default' });
  const { oauth2Clients, isFetchingListClients, setOauth2Clients } = useFetchingOAuthClients();

  const resetAppScreenState = () => {
    setAppScreenState({ type: 'default' });
  };

  const handleOpenAppCreator = () => {
    setAppScreenState({ type: 'creator' });
  };

  const removeOAuthClientById = (id: string) => {
    setOauth2Clients(oauth2Clients.filter((client) => client.id !== id));
  };

  const addOAuthClient = (client: OAuth2Client) => {
    setOauth2Clients([...oauth2Clients, client]);
  };

  const updateOAuthClient = (updatingClient: Partial<OAuth2Client>) => {
    setOauth2Clients(
      oauth2Clients.map((client) =>
        client.id === updatingClient.id
          ? {
              ...client,
              ...updatingClient,
            }
          : client
      )
    );
  };

  return {
    appScreenState,
    resetAppScreenState,
    setAppScreenState,
    handleOpenAppCreator,
    addOAuthClient,
    updateOAuthClient,
    oauth2Clients,
    isFetchingListClients,
    removeOAuthClientById,
  };
};
