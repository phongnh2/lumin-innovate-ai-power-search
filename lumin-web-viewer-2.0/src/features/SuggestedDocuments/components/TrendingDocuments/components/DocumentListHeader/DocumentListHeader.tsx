import classNames from 'classnames';
import { Menu, MenuItem, IconButton, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';

import { useTranslation } from 'hooks';

import { TrendingDocumentsContext } from 'features/SuggestedDocuments/contexts/TrendingDocuments.context';
import { ActionTypes } from 'features/SuggestedDocuments/reducers/TrendingDocuments.reducer';
import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { ownedOptions } from 'constants/documentConstants';

import styles from './DocumentListHeader.module.scss';

const DocumentListHeader = () => {
  const { t } = useTranslation();
  const { isVisible } = useChatbotStore();
  const { state, dispatch } = useContext(TrendingDocumentsContext);

  return (
    <div className={styles.container} data-chatbot-opened={isVisible}>
      <span className={classNames(styles.column, styles.nameCol)}>{t('common.name')}</span>
      <Menu
        ComponentTarget={
          <div className={classNames(styles.column, styles.ownerCol)}>
            <span>{t('common.owner')}</span>
            <IconButton
              size="sm"
              icon="caret-down-filled-sm"
              iconColor="var(--kiwi-colors-surface-on-surface-variant)"
            />
          </div>
        }
        width={140}
        position="bottom-start"
      >
        {ownedOptions.map((option, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              dispatch({ type: ActionTypes.SET_OWNED_FILTER, payload: { value: option.value } });
            }}
            rightSection={
              option.value === state.ownedFilter && (
                <Icomoon type="check-sm" color="var(--kiwi-colors-surface-on-surface-variant)" />
              )
            }
            style={{ minHeight: 40 }}
          >
            {t(option.label)}
          </MenuItem>
        ))}
      </Menu>
      <span className={classNames(styles.column, styles.storageCol)}>{t('common.storage')}</span>
      <span className={classNames(styles.column, styles.lastUpdated)}>{t('documentPage.lastOpened')}</span>
    </div>
  );
};

export default DocumentListHeader;
