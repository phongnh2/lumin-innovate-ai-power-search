import classNames from 'classnames';
import { motion } from 'motion/react';
import React, { ReactNode, Fragment, forwardRef } from 'react';

import ToolbarItem from '@new-ui/components/LuminToolbar/components/ToolbarItem';

import { useSortingFilteredGroupTool } from 'features/QuickSearch/hooks/useSortingFilteredGroupTool';
import { useTrackingSearchValue } from 'features/QuickSearch/hooks/useTrackingSearchValue';
import { QuickSearchGroupToolType, QuickSearchToolType } from 'features/QuickSearch/types';

import GroupToolLabel from './GroupToolLabel';
import SearchInChatbot from '../SearchInChatbot';
import SearchInDocument from '../SearchInDocument';

import styles from './GroupToolsMenu.module.scss';

interface GroupToolsMenuProps {
  onClickNavigationButton: (value: string) => boolean;
}

const GroupToolsMenu = forwardRef<HTMLDivElement, GroupToolsMenuProps>(({ onClickNavigationButton }, ref) => {
  const { searchKeyword, sortedFilteredGroupTools } = useSortingFilteredGroupTool();

  useTrackingSearchValue({ searchKeyword });

  const renderToolbarItem = ({ tool, toolbarValue }: { tool: QuickSearchToolType; toolbarValue: string }) => (
    <ToolbarItem
      key={tool.key}
      renderAsMenuItem
      customLabel={tool.title}
      showOptionButton={false}
      onChangeNavigationTab={() => onClickNavigationButton(toolbarValue)}
    >
      {tool.element as ReactNode}
    </ToolbarItem>
  );

  const renderQuickSearchTools = ({
    tool,
    groupTool,
  }: {
    tool: QuickSearchToolType;
    groupTool: QuickSearchGroupToolType;
  }) => {
    switch (true) {
      case groupTool.toolbarValue !== undefined:
        return renderToolbarItem({ tool, toolbarValue: groupTool.toolbarValue });
      case typeof tool.element === 'function':
        return tool.element({ onClickNavigationButton });
      default:
        return tool.element;
    }
  };

  return (
    <motion.div ref={ref} key="groupToolMenu" layout="position" className={styles.groupToolMenu}>
      {sortedFilteredGroupTools.map((group, index) => (
        <div
          key={`${group.key}-${index}`}
          className={classNames(styles.groupTool, { [styles.default]: !searchKeyword })}
        >
          <GroupToolLabel searchKeyword={searchKeyword} label={group.label} />
          {group.tools.map((tool: QuickSearchToolType) => (
            <Fragment key={tool.key}>{renderQuickSearchTools({ tool, groupTool: group })}</Fragment>
          ))}
        </div>
      ))}
      <SearchInChatbot keyword={searchKeyword} />
      <SearchInDocument keyword={searchKeyword} />
    </motion.div>
  );
});

export default GroupToolsMenu;
