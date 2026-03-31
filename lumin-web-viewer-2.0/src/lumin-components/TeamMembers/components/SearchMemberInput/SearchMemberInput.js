import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Input from 'lumin-components/Shared/Input';

import { useTranslation } from 'hooks';

const SearchMemberInput = React.forwardRef(({
  onChange,
  value,
  isOpen,
  onTransitionEnd,
  onBlur,
  onFocus,
}, ref) => {
  const { t } = useTranslation();

  const className = classNames('TeamMembers__search-input', {
    'TeamMembers__search-input--expand': isOpen,
  });

  return (
    <Input
      onChange={onChange}
      value={value}
      placeholder={t('searchPlaceholder.email')}
      className={className}
      icon="search"
      size="medium"
      onBlur={onBlur}
      onFocus={onFocus}
      ref={ref}
      showClearButton
      onTransitionEnd={onTransitionEnd}
    />
  );
});

SearchMemberInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onTransitionEnd: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
};

export default SearchMemberInput;
