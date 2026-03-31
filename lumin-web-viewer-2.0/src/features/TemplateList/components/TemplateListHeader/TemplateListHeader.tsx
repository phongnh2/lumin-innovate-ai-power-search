import classNames from 'classnames';
import React from 'react';

import { useTranslation } from 'hooks';
import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';

import styles from './TemplateListHeader.module.scss';

const TemplateListHeader = () => {
  const { t } = useTranslation();
  const { isPersonalTemplatePage } = useTemplatesPageMatch();

  return (
    <div className={styles.container} data-personal-route={isPersonalTemplatePage}>
      <span className={classNames(styles.column, styles.name)}>{t('common.name')}</span>
      {!isPersonalTemplatePage ? <span className={classNames(styles.column)}>{t('common.owner')}</span> : null}
      <span className={classNames(styles.column)}>{t('templatePage.lastModified')}</span>
    </div>
  );
};

export default TemplateListHeader;
