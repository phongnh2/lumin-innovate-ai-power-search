import { ScrollArea, ScrollAreaProps } from 'lumin-ui/kiwi-ui';
import React, { forwardRef, Ref } from 'react';

import styles from './ScrollAreaAutoSize.module.scss';

const ScrollAreaAutoSize = forwardRef((props: ScrollAreaProps, ref: Ref<HTMLDivElement>) => (
  <div className={styles.wrapperParent}>
    <div className={styles.wrapperChild}>
      <ScrollArea ref={ref} {...props} />
    </div>
  </div>
));

export default ScrollAreaAutoSize;
