import { Dialog as KiwiDialog } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { Suspense } from 'react';

import Dialog from './Dialog';

const LazyContentDialog = React.forwardRef(({ title, children, fallback, isReskin, ...rest }, ref) => {
  if (isReskin) {
    return (
      <KiwiDialog ref={ref} {...rest}>
        <Suspense fallback={fallback}>{children}</Suspense>
      </KiwiDialog>
    );
  }

  return (
    <Dialog ref={ref} {...rest}>
      {title}
      <Suspense fallback={fallback}>{children}</Suspense>
    </Dialog>
  );
});

LazyContentDialog.propTypes = {
  title: PropTypes.node,
  fallback: PropTypes.element.isRequired,
  children: PropTypes.node.isRequired,
  isReskin: PropTypes.bool,
};

LazyContentDialog.defaultProps = {
  title: null,
  isReskin: false,
};

export default LazyContentDialog;
