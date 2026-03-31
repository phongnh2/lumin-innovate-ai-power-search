import classNames from 'classnames';
import { Button, Icomoon, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Loading from 'luminComponents/Loading';

import { useTranslation } from 'hooks';

import { LIMIT_API_KEY } from 'constants/organizationConstants';

import ApiKeyItem from './components/ApiKeyItem';
import ApiKeyModal from './components/ApiKeyModal';
import useApiKey from './hooks/useApiKey';
import developerApiStyles from '../../DeveloperApi.module.scss';

import styles from './ApiKey.module.scss';

const ApiKey = () => {
  const { t } = useTranslation();
  const {
    openType,
    createApiKey,
    handleCloseModal,
    handleCreate,
    errorText,
    apiKeys,
    isFetching,
    handleMakePrimary,
    handleDelete,
    renameApiKey,
    selectedKey,
    handleRename,
    canModifyApiKey,
  } = useApiKey();

  const renderApiKeyList = () =>
    apiKeys.length > 0 ? (
      <>
        <div className={classNames(styles.header, styles.rowWrapper)}>
          <p>{t('common.name')}</p>
          <p>{t('developerApi.value')}</p>
          <p>{t('common.created')}</p>
          <p>{t('developerApi.lastUsed')}</p>
          <p>{t('developerApi.primaryKey')}</p>
          <p />
        </div>
        {apiKeys.map((item) => (
          <ApiKeyItem
            key={item.id}
            apiKey={item}
            totalKeys={apiKeys.length}
            canModifyApiKey={canModifyApiKey}
            onRename={handleRename}
            onMakePrimary={handleMakePrimary}
            onDelete={handleDelete}
          />
        ))}
      </>
    ) : (
      <p className={styles.noApiKey}>{t('developerApi.noApiKey')}</p>
    );

  return (
    <>
      <div className={developerApiStyles.sectionHeaderWrapper}>
        <div>
          <h2 className={developerApiStyles.sectionTitle}>{t('developerApi.apikey')}</h2>
          <p className={developerApiStyles.sectionDescription}>{t('developerApi.apikeyDescription')}</p>
        </div>

        {canModifyApiKey && (
          <PlainTooltip
            content={
              apiKeys.length >= LIMIT_API_KEY ? t('developerApi.reachedLimitApiKey', { limit: LIMIT_API_KEY }) : ''
            }
          >
            <Button
              size="lg"
              startIcon={<Icomoon type="ph-plus" size="lg" />}
              onClick={handleCreate}
              disabled={apiKeys.length >= LIMIT_API_KEY}
            >
              {t('developerApi.generateKey')}
            </Button>
          </PlainTooltip>
        )}
      </div>
      <div className={styles.apiKeyList}>
        {isFetching ? <Loading normal useReskinCircularProgress reskinSize="sm" /> : renderApiKeyList()}
      </div>
      {openType && (
        <ApiKeyModal
          selectedKey={selectedKey}
          openType={openType}
          handleCloseModal={handleCloseModal}
          createApiKey={createApiKey}
          errorText={errorText}
          renameApiKey={renameApiKey}
        />
      )}
    </>
  );
};
export default ApiKey;
