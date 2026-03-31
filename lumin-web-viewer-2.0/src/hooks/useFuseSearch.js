import { useMemo } from 'react';
import Fuse from 'fuse.js';

import useSearchDebounce from './useSearchDebounce';

export function useFuseSearch({
  data, options, maxLength = 100,
}) {
  const { searchText, value, onChange } = useSearchDebounce({ maxLength });

  const fuse = useMemo(() => new Fuse(data, options), [data]);
  const filterResults = value ? fuse.search(value).map((result) => result.item) : data;

  return {
    searchText,
    onChange,
    results: filterResults,
  };
}
