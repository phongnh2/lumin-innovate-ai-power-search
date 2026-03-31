import { Text, Checkbox as KiwiCheckbox } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import styles from '../BulkUpdateSharePermission.module.scss';

function BulkUpdateListItem({
  text,
  checked,
  disabled = false,
  onChange,
}) {
  const onCheckboxChange = () => {
    if (disabled) {
      return;
    }
    onChange(!checked);
  };
  return (
    <li className={styles.itemWrapper} disabled={disabled} onClick={onCheckboxChange}>
      <KiwiCheckbox checked={checked} disabled={disabled} onChange={onCheckboxChange} />
      <Text type="body" size="md">
        {text}
      </Text>
    </li>
  );
}

BulkUpdateListItem.propTypes = {
  text: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

export default BulkUpdateListItem;
