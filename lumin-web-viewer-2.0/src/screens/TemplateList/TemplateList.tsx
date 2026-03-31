import classNames from 'classnames';
import React, { useMemo, useRef } from 'react';
import { compose } from 'redux';

import { withUploadTemplatesProvider } from 'HOC/withDropDocPopup/withDropDocPopupProvider';
import withPremiumUserPathRedirect from 'HOC/withPremiumUserPathRedirect';
import withTemplateTitle from 'HOC/withTemplateTitle';

import { useSetupCoreWorker } from 'hooks';

import TemplateHeader from 'features/TemplateList/components/TemplateHeader';
import TemplateListComponent from 'features/TemplateList/components/TemplateList';

import { TemplateListScreenContext } from './contexts';

import styles from './TemplateList.module.scss';

const TemplateList = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const contextValue = useMemo(() => ({ scrollRef }), [scrollRef]);
  useSetupCoreWorker();

  return (
    <TemplateListScreenContext.Provider value={contextValue}>
      <div className={styles.containerReskin}>
        <TemplateHeader />
        <div className={styles.listContainer}>
          <div
            ref={scrollRef}
            className={classNames(
              'custom-scrollbar-reskin custom-scrollbar--overflow-y-auto',
              styles.scrollerContainer
            )}
          >
            <TemplateListComponent />
          </div>
        </div>
      </div>
    </TemplateListScreenContext.Provider>
  );
};

export default compose(withPremiumUserPathRedirect, withUploadTemplatesProvider, withTemplateTitle)(TemplateList);
