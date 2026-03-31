import { useCallback, useState } from "react";

import { Category } from "@/components/Category";
import FeaturedLegalContent from "@/components/TemplateLibraryDiscover/components/FeaturedLegalContent";
import MostPopularTemplates from "@/components/TemplateLibraryDiscover/components/MostPopularTemplates";
import NewInLumin from "@/components/TemplateLibraryDiscover/components/NewInLumin";
import TabNavigation from "@/components/TemplateLibraryDiscover/components/TabNavigation";
import { TemplateLibraryDiscoverTabs } from "@/components/TemplateLibraryDiscover/constants";

import styles from "./Gallery.module.scss";

const Gallery = () => {
  const [activeTab, setActiveTab] = useState(
    TemplateLibraryDiscoverTabs.DISCOVER,
  );
  const handleTabChange = useCallback((tab: TemplateLibraryDiscoverTabs) => {
    setActiveTab(tab);
  }, []);

  const commonContent = (
    <>
      <FeaturedLegalContent />
      <Category.Carousel />
      <NewInLumin />
      <MostPopularTemplates />
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case TemplateLibraryDiscoverTabs.DISCOVER:
        return commonContent;
      case TemplateLibraryDiscoverTabs.WORK:
        return commonContent;
      case TemplateLibraryDiscoverTabs.LIFE:
        return commonContent;
      default:
        return commonContent;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <TabNavigation
          activeTab={activeTab}
          handleTabChange={handleTabChange}
        />
        <div key={activeTab} className={styles.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
