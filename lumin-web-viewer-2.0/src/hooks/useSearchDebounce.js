import { useCallback, useState } from 'react';
import debounce from 'lodash/debounce';
import { DEBOUNCED_SEARCH_TIME } from 'constants/lumin-common';

function useSearchDebounce({ maxLength = 100 } = {}) {
  const [searchText, setSearchText] = useState('');
  const [value, setValue] = useState('');

  const onSearch = useCallback(debounce((text) => {
    setValue(text);
  }, DEBOUNCED_SEARCH_TIME), []);

  const onChange = (e) => {
    const text = e.target.value || '';
    if (text.length < maxLength) {
      setSearchText(text);
    }
    onSearch(text);
  };

  return {
    value,
    searchText,
    onChange,
  };
}

export default useSearchDebounce;
