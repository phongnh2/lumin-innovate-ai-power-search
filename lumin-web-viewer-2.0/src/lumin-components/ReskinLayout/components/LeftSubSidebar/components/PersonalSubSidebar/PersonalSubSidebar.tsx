import { Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { SubSidebarItem } from '@web-new-ui/components/SubSidebarItem';

import { useTranslation } from 'hooks';

import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { AWS_EVENTS } from 'constants/awsEvents';
import { Routers } from 'constants/Routers';

import styles from '../../LeftSubSidebar.module.scss';
import { DocumentItemsContainer } from '../DocumentItemsContainer';

const PersonalSubSidebar = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.itemsContainer}>
        <DocumentItemsContainer t={t} baseRoute={Routers.DOCUMENTS} />
      </div>
      <div className={styles.itemsWrapper}>
        <Text
          color="var(--kiwi-colors-surface-on-surface-variant)"
          size="xs"
          type="headline"
          className={styles.exploreTitle}
        >
          {t('sidebar.explore')}
        </Text>
        <div className={styles.itemsContainer}>
          <SubSidebarItem
            leftElement={<Icomoon type="sparkles-md" size="md" color="var(--kiwi-colors-surface-on-surface)" />}
            title={t('sidebar.templateGallery')}
            to="/webopt"
            activeTab="documentTab"
            data-cy="template_gallery"
            data-lumin-btn-name={NavigationNames.TEMPLATES_GALLERY}
            data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
          />
        </div>
      </div>
    </>
  );
};

export default PersonalSubSidebar;
