import { EyeIcon } from '@luminpdf/icons/dist/csr/Eye';
import { PencilIcon } from '@luminpdf/icons/dist/csr/Pencil';
import { StarIcon } from '@luminpdf/icons/dist/csr/Star';
import { TrashIcon } from '@luminpdf/icons/dist/csr/Trash';
import classNames from 'classnames';
import { ButtonSize, Divider, IconButton, Menu, MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import CopyButton from 'ui/components/CopyButton';
import { CopyButtonType } from 'ui/components/CopyButton/constants';

import Loading from 'luminComponents/Loading';

import { useTranslation } from 'hooks';

import dateUtil from 'utils/date';

import { useApiAppContext } from 'features/DeveloperApi/hooks/useApiAppContext';
import { ApplicationType } from 'features/DeveloperApi/interfaces';
import { mapAppTypeToTitle } from 'features/DeveloperApi/utils/mapAppTypeToTitle';

import { useEditOAuth2Client } from './hooks/useEditOAuth2Client';
import { useHandleRevokeClient } from './hooks/useHandleRevokeClient';
import { useRotateClientSecret } from './hooks/useRotateClientSecret';
import { useViewClientDetail } from './hooks/useViewClientDetail';

import styles from './OAuth2List.module.scss';

const OAuthClientList = () => {
  const { oauth2Clients, isFetchingListClients } = useApiAppContext();
  const { handleEditOAuth2Client } = useEditOAuth2Client();
  const { handleViewClientDetail } = useViewClientDetail({ oauth2Clients });
  const { handleRotateClientSecret, handleRotateSigningSecret } = useRotateClientSecret();
  const { handleRevokeClient } = useHandleRevokeClient();

  const { t } = useTranslation();

  const oauthClientListHeader: string[] = t('developerApi.integrationApps.clientListHeader', { returnObjects: true });

  const formattedClientId = (value: string) => `${value.slice(0, 16)}...${value.slice(-3)}`;

  if (isFetchingListClients) {
    return (
      <div className={styles.oauthClientList}>
        <Loading normal useReskinCircularProgress reskinSize="sm" />
      </div>
    );
  }

  if (oauth2Clients.length === 0) {
    return <p className={styles.noOAuthClients}>{t('developerApi.integrationApps.noIntegrationApps')}</p>;
  }

  return (
    <table className={styles.oauthClientList}>
      <colgroup>
        <col style={{ width: '15%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '5%' }} />
      </colgroup>
      <thead>
        <tr className={styles.oauthClientListHeader}>
          {oauthClientListHeader.map((header) => (
            <th className={styles.cellHeader} key={header}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {oauth2Clients.map((client) => (
          <tr key={client.id}>
            <td
              className={classNames(styles.cellContent, styles.clickable)}
              onClick={() => handleViewClientDetail(client.id)}
            >
              {client.clientName}
            </td>
            <td className={styles.cellContent}>
              <span className={styles.clientId}>{formattedClientId(client.clientId)}</span>
              <CopyButton
                type={CopyButtonType.DEFAULT}
                size={ButtonSize.sm}
                textContent={client.clientId}
                dataCy="copy-client-id"
              />
            </td>
            <td className={styles.cellContent}>{mapAppTypeToTitle(client.applicationType)}</td>
            <td className={styles.cellContent}>{client.owner.name}</td>
            <td className={styles.cellContent}>{dateUtil.formatFullDate(client.createdAt)}</td>
            <td className={styles.cellActions}>
              <Menu
                position="bottom-end"
                closeOnItemClick={false}
                ComponentTarget={<IconButton icon="dots-vertical-md" size="md" />}
                width="200px"
              >
                <MenuItem leftSection={<EyeIcon size={16} />} onClick={() => handleViewClientDetail(client.id)}>
                  {t('developerApi.integrationApps.viewDetails')}
                </MenuItem>
                <MenuItem leftSection={<PencilIcon size={16} />} onClick={() => handleEditOAuth2Client(client)}>
                  {t('developerApi.integrationApps.editApplication')}
                </MenuItem>
                {client.applicationType === ApplicationType.SERVER_APPLICATION && (
                  <>
                    <MenuItem leftSection={<StarIcon size={16} />} onClick={() => handleRotateClientSecret(client.id)}>
                      {t('developerApi.integrationApps.rotateSecret')}
                    </MenuItem>
                    <MenuItem leftSection={<StarIcon size={16} />} onClick={() => handleRotateSigningSecret(client.id)}>
                      {t('developerApi.integrationApps.rotateWebhookSigningSecret')}
                    </MenuItem>
                  </>
                )}
                <Divider className={styles.divider} />
                <MenuItem
                  className={styles.revokeMenuItem}
                  leftSection={<TrashIcon size={16} />}
                  onClick={() => handleRevokeClient(client.id)}
                >
                  {t('developerApi.integrationApps.revoke')}
                </MenuItem>
              </Menu>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OAuthClientList;
