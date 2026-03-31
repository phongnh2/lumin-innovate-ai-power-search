import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { useSetupCoreWorker, useTranslation } from 'hooks';

import { initializeStickyElements } from 'utils/stickyUtils';

import AgreementGenInputBox from 'features/CNC/CncComponents/AgreementGenInputBox';
import { SuggestedDocsTypes } from 'features/SuggestedDocuments';
import { RecentDocumentsProvider } from 'features/SuggestedDocuments/components/RecentDocuments/components';
import { TrendingDocumentsProvider } from 'features/SuggestedDocuments/components/TrendingDocuments/components';

import { Routers } from 'constants/Routers';

import DocumentTabSwitcher from '../DocumentTabSwitcher';
import RecentDocuments from '../RecentDocuments';
import TrendingDocuments from '../TrendingDocuments';

import styles from './SuggestedDocuments.module.scss';

const SuggestedDocuments = () => {
  const { t } = useTranslation();
  useSetupCoreWorker();

  const location = useLocation();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      initializeStickyElements(containerRef.current, '.holder');
    }
  }, [location]);

  return (
    <RecentDocumentsProvider>
      <TrendingDocumentsProvider>
        <div className={styles.container} ref={containerRef}>
          <AgreementGenInputBox />
          <div className={classNames(styles.header, 'holder')}>
            <h2 className={styles.title}>{t('suggestedDocuments.title')}</h2>
            <DocumentTabSwitcher />
          </div>
          <Routes>
            <Route path={`${SuggestedDocsTypes.RECENT}`} element={<RecentDocuments />} />
            <Route path={`${SuggestedDocsTypes.TRENDING}`} element={<TrendingDocuments />} />
            <Route path="/" element={<Navigate to={`${SuggestedDocsTypes.RECENT}`} replace />} />
            <Route path="*" element={<Navigate to={Routers.NOT_FOUND} replace />} />
          </Routes>
        </div>
      </TrendingDocumentsProvider>
    </RecentDocumentsProvider>
  );
};

export default SuggestedDocuments;
