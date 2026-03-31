import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import type { SearchResponse } from "@/interfaces/api.interface";
import { templatesApi } from "@/services/templatesApi";

const SEARCH_DEBOUNCE_DELAY = 300;

export const useSearchTemplates = () => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (searchText.length > 0) {
      setIsDebouncing(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setIsDebouncing(false);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [searchText]);

  const { data, isLoading, error, refetch } = useQuery<SearchResponse>({
    queryKey: ["searchTemplates", debouncedSearchText],
    queryFn: () => templatesApi.search(debouncedSearchText),
    enabled: debouncedSearchText.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateSearchText = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchText("");
    setDebouncedSearchText("");
    setIsDebouncing(false);
  }, []);

  return {
    searchText,
    debouncedSearchText,
    updateSearchText,
    clearSearch,
    data,
    isLoading: isLoading || isDebouncing,
    error,
    refetch,
    hasResults:
      data?.results?.some((result) => result.hits.length > 0) ?? false,
  };
};
