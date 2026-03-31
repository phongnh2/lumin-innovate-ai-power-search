import React from 'react';
import PropTypes from 'prop-types';

import { useTrackFormEvent } from 'hooks';

function TrackedForm({
  children,
  className,
  formName,
  formPurpose,
  onSubmit,
  onReset,
  ...otherProps
}) {
  const { trackSubmitForm, trackResetForm } = useTrackFormEvent();

  const handleSubmit = (e) => {
    onSubmit(e);
    trackSubmitForm(e);
    e.preventDefault();
  };

  return (
    <form
      className={className}
      data-lumin-form-name={formName}
      data-lumin-form-purpose={formPurpose}
      onSubmit={handleSubmit}
      onReset={trackResetForm}
      {...otherProps}
    >
      {children}
    </form>
  );
}

TrackedForm.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
  formName: PropTypes.string,
  formPurpose: PropTypes.string,
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
};

TrackedForm.defaultProps = {
  className: '',
  formName: '',
  formPurpose: '',
  onSubmit: () => {},
  onReset: () => {},
};

export default TrackedForm;
