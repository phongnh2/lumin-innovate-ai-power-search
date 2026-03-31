import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useGetQuickSearchGroupTools } from './useGetQuickSearchGroupTools';
import { quickSearchSelectors } from '../slices';
import { QuickSearchGroupToolType, QuickSearchToolType } from '../types';

export const useSortingFilteredGroupTool = () => {
  const { QUICK_SEARCH_GROUP_TOOLS } = useGetQuickSearchGroupTools();
  const { searchKeyword, matchedTools } = useSelector(quickSearchSelectors.searchResults);

  const sortedFilteredGroupTools = useMemo(() => {
    if (!searchKeyword) {
      return QUICK_SEARCH_GROUP_TOOLS.filter((group) => !group.onlyVisibleOnSearch);
    }

    const toolGroupMap = new Map<string, { tool: QuickSearchToolType; group: QuickSearchGroupToolType }>();
    QUICK_SEARCH_GROUP_TOOLS.forEach((group) => {
      group.tools.forEach((tool) => {
        toolGroupMap.set(tool.key, { tool, group });
      });
    });

    const sortedGroupMap: QuickSearchGroupToolType[] = [];

    matchedTools.forEach((key) => {
      const item = toolGroupMap.get(key);
      if (!item) {
        return;
      }

      const { tool, group } = item;
      sortedGroupMap.push({ key: group.key, label: group.label, toolbarValue: group.toolbarValue, tools: [tool] });
    });

    return sortedGroupMap;
  }, [matchedTools, searchKeyword]);

  return {
    searchKeyword,
    sortedFilteredGroupTools,
  };
};
