import { Button, Icomoon, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

import { useTranslation } from 'hooks';
import useGetCurrentOrganization from 'hooks/useGetCurrentOrganization';

import { ApiAppContext } from 'features/DeveloperApi/context';

import { OrganizationRoles } from 'constants/organization.enum';

import { useApiAppsHandler } from './hooks/useApiAppsHandler';
import developerApiStyles from '../../DeveloperApi.module.scss';
import OAuth2Creator from '../OAuth2Creator';
import OAuth2Editting from '../OAuth2Editting';
import OAuth2List from '../OAuth2List';

const MAX_APP_LIMIT = 5;

const ApiApps = () => {
  const { t } = useTranslation();
  const {
    appScreenState,
    setAppScreenState,
    handleOpenAppCreator,
    resetAppScreenState,
    oauth2Clients,
    isFetchingListClients,
    removeOAuthClientById,
    addOAuthClient,
    updateOAuthClient,
  } = useApiAppsHandler();
  const currentOrganization = useGetCurrentOrganization();

  const contextValue = useMemo(
    () => ({
      appScreenState,
      setAppScreenState,
      handleOpenAppCreator,
      resetAppScreenState,
      oauth2Clients,
      isFetchingListClients,
      removeOAuthClientById,
      addOAuthClient,
      updateOAuthClient,
    }),
    [
      appScreenState,
      setAppScreenState,
      handleOpenAppCreator,
      resetAppScreenState,
      oauth2Clients,
      isFetchingListClients,
      removeOAuthClientById,
      addOAuthClient,
      updateOAuthClient,
    ]
  );

  const isDisabledCreateApp = oauth2Clients?.length >= MAX_APP_LIMIT || isFetchingListClients;
  const canCreateApp = currentOrganization.userRole === OrganizationRoles.ORGANIZATION_ADMIN;

  return (
    <ApiAppContext.Provider value={contextValue}>
      {appScreenState.type === 'creator' && <OAuth2Creator />}
      {appScreenState.type === 'editting' && <OAuth2Editting />}
      {appScreenState.type === 'default' && (
        <>
          <div className={developerApiStyles.sectionHeaderWrapper}>
            <div>
              <h2 className={developerApiStyles.sectionTitle}>{t('developerApi.integrationApps.title')}</h2>
              <p className={developerApiStyles.sectionDescription}>{t('developerApi.integrationApps.description')}</p>
            </div>
            {canCreateApp && (
              <PlainTooltip
                position="top-end"
                content={
                  oauth2Clients?.length >= MAX_APP_LIMIT
                    ? t('developerApi.integrationApps.maxAppLimit', { count: MAX_APP_LIMIT })
                    : undefined
                }
              >
                <Button
                  size="lg"
                  startIcon={<Icomoon type="ph-plus" size="lg" />}
                  onClick={handleOpenAppCreator}
                  disabled={isDisabledCreateApp}
                >
                  {t('developerApi.integrationApps.createApp')}
                </Button>
              </PlainTooltip>
            )}
          </div>
          <OAuth2List />
        </>
      )}
    </ApiAppContext.Provider>
  );
};

export default ApiApps;
