import classNames from 'classnames';
import React, { forwardRef } from 'react';

import styles from './BaseScrollContainer.module.scss';

type BaseScrollContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const BaseScrollContainer = forwardRef<HTMLDivElement, BaseScrollContainerProps>((props, ref) => (
  <div {...props} className={classNames(styles.container, props.className, 'custom-scrollbar-reskin')} ref={ref} />
));

export default BaseScrollContainer;
