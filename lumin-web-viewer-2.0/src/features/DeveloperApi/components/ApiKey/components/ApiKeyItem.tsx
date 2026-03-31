import classNames from 'classnames';
import { ButtonSize, Divider, Icomoon, IconButton, Menu, MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import CopyButton from 'ui/components/CopyButton';
import { CopyButtonType } from 'ui/components/CopyButton/constants';

import { useTranslation } from 'hooks';

import { IApiKey } from 'services/developerApiServices';

import { dateUtil } from 'utils';

import styles from '../ApiKey.module.scss';

type Props = {
  apiKey: IApiKey;
  totalKeys: number;
  canModifyApiKey: boolean;
  onRename: (apiKey: IApiKey) => void;
  onMakePrimary: (apiKey: IApiKey) => void;
  onDelete: (apiKey: IApiKey) => void;
};

function ApiKeyItem(props: Props) {
  const { apiKey, totalKeys, canModifyApiKey, onRename, onMakePrimary, onDelete } = props;
  const { t } = useTranslation();
  const formattedApiKeyValue = (value: string) => `${value.slice(0, 16)}...${value.slice(-3)}`;

  return (
    <div key={apiKey.id} className={classNames(styles.row, styles.rowWrapper)}>
      <p>{apiKey.name}</p>
      <p className={styles.valueColumn}>
        {formattedApiKeyValue(apiKey.value)}
        <CopyButton
          type={CopyButtonType.DEFAULT}
          size={ButtonSize.sm}
          textContent={apiKey.value}
          dataCy="copy-client-id"
        />
      </p>
      <p>{dateUtil.formatFullDate(apiKey.createdAt)}</p>
      <p>{apiKey.lastUsedAt ? dateUtil.formatFullDate(apiKey.lastUsedAt) : t('developerApi.never')}</p>
      <p>{apiKey.isPrimaryKey ? t('common.yes') : t('common.no')}</p>
      <p>
        {canModifyApiKey && (
          <Menu ComponentTarget={<IconButton icon="dots-vertical-md" size="md" />} position="bottom-end">
            {!apiKey.isPrimaryKey && (
              <MenuItem
                leftSection={<Icomoon type="ph-star" size="md" />}
                onClick={() => onMakePrimary(apiKey)}
                disabled={apiKey.isPrimaryKey}
              >
                {t('developerApi.makePrimary')}
              </MenuItem>
            )}
            <MenuItem leftSection={<Icomoon type="ph-pencil-simple" size="md" />} onClick={() => onRename(apiKey)}>
              {t('common.rename')}
            </MenuItem>
            {totalKeys > 1 && !apiKey.isPrimaryKey && (
              <>
                <Divider className={styles.divider} />
                <MenuItem leftSection={<Icomoon type="ph-trash" size="md" />} onClick={() => onDelete(apiKey)}>
                  {t('action.delete')}
                </MenuItem>
              </>
            )}
          </Menu>
        )}
      </p>
    </div>
  );
}

export default ApiKeyItem;
