import clsx from "clsx";
import { useRef, useEffect, useState } from "react";

import { TemplateLibraryDiscoverTabs } from "../../constants";

import styles from "./TabNavigation.module.scss";

interface ITabNavigationProps {
  activeTab: TemplateLibraryDiscoverTabs;
  handleTabChange: (tab: TemplateLibraryDiscoverTabs) => void;
}

const TabNavigation = ({ activeTab, handleTabChange }: ITabNavigationProps) => {
  const tabs = [
    TemplateLibraryDiscoverTabs.DISCOVER,
    TemplateLibraryDiscoverTabs.WORK,
    TemplateLibraryDiscoverTabs.LIFE,
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const activeButton = container.querySelector(
      `.${styles.tabActive}`,
    ) as HTMLElement;
    if (activeButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  return (
    <nav className={styles.container} ref={containerRef}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabChange(tab)}
          className={clsx(styles.tab, activeTab === tab && styles.tabActive)}
        >
          {tab}
        </button>
      ))}
      <span
        className={styles.indicator}
        style={{
          transform: `translateX(${indicatorStyle.left}px)`,
          width: `${indicatorStyle.width}px`,
        }}
      />
    </nav>
  );
};

export default TabNavigation;
