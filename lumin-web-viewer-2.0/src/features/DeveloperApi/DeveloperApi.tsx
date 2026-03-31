import { Button, Icomoon, Tabs, Text } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'hooks';

import AccountCallback from './components/AccountCallback';
import ApiApps from './components/ApiApps';
import ApiKey from './components/ApiKey';

import styles from './DeveloperApi.module.scss';

const TABS = [
  { value: 'api_key', label: 'developerApi.apikey' },
  { value: 'integration_apps', label: 'developerApi.integrationApps.title' },
];

function DeveloperApi() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState(TABS[0].value);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <section className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headerWrapper}>
          <h2 className={styles.pageTitle}>{t('developerApi.title')}</h2>
          <Link tabIndex={-1} to="https://developers.luminpdf.com/docs/api/intro/" target="_blank">
            <Button variant="outlined" size="lg" endIcon={<Icomoon type="ph-arrow-square-out" size="lg" />}>
              {t('developerApi.viewDocumentation')}
            </Button>
          </Link>
        </div>
        <Tabs onChange={handleTabChange} value={currentTab}>
          <Tabs.List>
            {TABS.map((tab) => (
              <Tabs.Tab role="button" tabIndex={0} value={tab.value} key={tab.value}>
                <Text type="label" size="md">
                  {t(tab.label)}
                </Text>
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
        {currentTab === 'api_key' && (
          <>
            <div className={styles.sectionContainer}>
              <ApiKey />
            </div>
            <div className={styles.sectionContainer}>
              <AccountCallback />
            </div>
          </>
        )}
        {currentTab === 'integration_apps' && (
          <div className={styles.sectionContainer}>
            <ApiApps />
          </div>
        )}
      </div>
    </section>
  );
}

export default DeveloperApi;
