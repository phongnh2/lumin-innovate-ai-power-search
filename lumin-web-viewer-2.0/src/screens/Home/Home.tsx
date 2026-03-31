import { ScrollArea } from 'lumin-ui/kiwi-ui';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose } from 'redux';

import LuminLogo from 'assets/lumin-svgs/logo-lumin.svg';

import selectors from 'selectors';

import PageTitlePortal from 'luminComponents/PortalElement/PageTitlePortal';
import TopFeaturesSection from 'luminComponents/TopFeaturesSection';

import withDropDocPopup from 'HOC/withDropDocPopup';
import withPremiumUserPathRedirect from 'HOC/withPremiumUserPathRedirect';
import withRedirectToMyDocumentOnNewPage from 'HOC/withRedirectToMyDocumentOnNewPage';

import { useRestrictedUploadDocumentModal } from 'hooks/useRestrictedUploadDocumentModal';

import SearchResult from 'features/HomeSearch/components/SearchResult';
import SuggestedDocuments from 'features/SuggestedDocuments/components/SuggestedDocuments';

import { Routers } from 'constants/Routers';

import { HomeContext } from './contexts';
import { useCleanHomeUrlFromSign } from './hooks';

import styles from './Home.module.scss';

const Home = () => {
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { isFocusing: isInSearchView, searchKey } = useSelector(selectors.getPageSearchData);

  const contextValue = useMemo(() => ({ scrollRef }), [scrollRef]);

  useCleanHomeUrlFromSign();
  useRestrictedUploadDocumentModal();

  return (
    <HomeContext.Provider value={contextValue}>
      <PageTitlePortal.Element>
        <Link to={Routers.ROOT} className={styles.luminLogoContainer}>
          <img src={LuminLogo} alt="Lumin logo" />
        </Link>
      </PageTitlePortal.Element>
      <div className={styles.container} data-search-mode={isInSearchView || Boolean(searchKey)}>
        {isInSearchView || searchKey ? (
          <SearchResult searchKey={searchKey} />
        ) : (
          <ScrollArea
            classNames={{
              root: styles.scrollAreaRoot,
              viewport: styles.scrollAreaViewport,
              scrollbar: styles.scrollAreaScrollbar,
            }}
            scrollbars="y"
            type="auto"
            viewportRef={(el) => setScrollRef(el)}
          >
            <div className={styles.wrapper}>
              <TopFeaturesSection />
              <div className={styles.contentWrapper}>
                <SuggestedDocuments />
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </HomeContext.Provider>
  );
};

export default compose(withPremiumUserPathRedirect, withRedirectToMyDocumentOnNewPage, withDropDocPopup.Provider)(Home);
