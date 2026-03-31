import { Tabs as BaseTabs } from '@mui/base/Tabs';
import PropTypes from 'prop-types';
import React from 'react';

import * as styles from './Tabs.styled';

const Tabs = React.forwardRef((props, ref) => {
  const { className, ...otherProps } = props;
  return <BaseTabs {...otherProps} ref={ref} css={styles.tabs} className={className} />;
});

Tabs.displayName = 'Tabs';

Tabs.propTypes = {
  className: PropTypes.string,
};

Tabs.defaultProps = {
  className: '',
};

export default Tabs;
