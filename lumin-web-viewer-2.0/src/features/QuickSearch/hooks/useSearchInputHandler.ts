import Fuse from 'fuse.js';
import latinize from 'latinize';
import { debounce } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

import selectors from 'selectors';

import { MENU_FADE_IN_RIGHT_DURATION } from 'luminComponents/ViewerCommonV2/NavigationButton/constants';

import { quickSearchSelectors, setSearchResults } from 'features/QuickSearch/slices';

import { LANGUAGES } from 'constants/language';

import { useGetQuickSearchGroupTools } from './useGetQuickSearchGroupTools';
import { QUICK_SEARCH_KEYWORDS } from '../constants';

export const useSearchInputHandler = () => {
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const language = useSelector(selectors.getLanguage);
  const isOpenQuickSearch = useSelector(quickSearchSelectors.isOpenQuickSearch);

  const { ALL_QUICK_SEARCH_NORMALIZED_TOOLS_TITLE } = useGetQuickSearchGroupTools();

  const filteringMatchedTitleFuse = useMemo(
    () =>
      new Fuse(ALL_QUICK_SEARCH_NORMALIZED_TOOLS_TITLE, {
        keys: ['fuseTitle', 'fuseTokens'],
        includeScore: true,
        includeMatches: true,
        threshold: 0.3,
      }),
    [ALL_QUICK_SEARCH_NORMALIZED_TOOLS_TITLE]
  );

  const debounceFocusSearchInput = useDebouncedCallback(() => {
    inputRef.current?.focus();
  }, MENU_FADE_IN_RIGHT_DURATION);

  const findKeywordIndices = ({ keywords, searchTerms }: { keywords: string[]; searchTerms: string[] }): number[] =>
    searchTerms.map((term) =>
      keywords.findIndex((keyword) => latinize(keyword.toLowerCase()).includes(latinize(term)))
    );

  const getMatchedToolsWithRanking = ({
    toolKey,
    keywords,
    searchTerms,
  }: {
    toolKey: string;
    keywords: Record<LANGUAGES, string[]>;
    searchTerms: string[];
  }) => {
    const matchedIndices = findKeywordIndices({ keywords: keywords[language], searchTerms });

    const allTermsMatch = matchedIndices.every((index) => index !== -1);

    if (!allTermsMatch) {
      return null;
    }

    const bestMatchedIndice = Math.min(...matchedIndices);

    return {
      key: toolKey,
      rank: bestMatchedIndice,
    };
  };

  const processMatchedToolsByKeywordRanking = ({ searchTerms }: { searchTerms: string[] }): string[] => {
    const matchedToolsByKeywordRanking = Object.entries(QUICK_SEARCH_KEYWORDS).map(([key, keywords]) =>
      getMatchedToolsWithRanking({ toolKey: key, keywords, searchTerms })
    );

    return matchedToolsByKeywordRanking
      .filter((item): item is { key: string; rank: number } => item !== null)
      .sort((a, b) => a.rank - b.rank)
      .map((item) => item.key);
  };

  const processMatchedToolsByTitle = (searchKeyword: string) =>
    filteringMatchedTitleFuse
      .search(latinize(searchKeyword))
      .sort((a, b) => a.score - b.score)
      .map((item) => item.item.key);

  const handleSearch = (input: string) => {
    const matchedToolsByTitle = processMatchedToolsByTitle(input);

    const searchTerms = input.trim().toLowerCase().split(/\s+/);

    const matchedToolsByKeywordRanking = processMatchedToolsByKeywordRanking({ searchTerms });

    const finalMatchedTools = [
      ...matchedToolsByTitle,
      ...matchedToolsByKeywordRanking.filter((tool) => !matchedToolsByTitle.includes(tool)),
    ];

    dispatch(
      setSearchResults({
        searchKeyword: input,
        matchedTools: finalMatchedTools,
      })
    );
  };

  const debouncedSetSearchValue = useMemo(() => debounce((value: string) => handleSearch(value), 300), []);

  const onChangeSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchValue(e.target.value);
  };

  useEffect(() => {
    if (isOpenQuickSearch) {
      debounceFocusSearchInput();
    }

    return () => {
      debouncedSetSearchValue.cancel();
    };
  }, [isOpenQuickSearch, debounceFocusSearchInput, debouncedSetSearchValue]);

  return {
    inputRef,
    isOpenQuickSearch,
    onChangeSearchInput,
  };
};
