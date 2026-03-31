import { BaseSyntheticEvent, FormHTMLAttributes, ReactNode } from 'react';

import { useTrackFormEvent } from '@/hooks/useTrackingFormEvent';

type Props = Exclude<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  children: ReactNode;
  onSubmit: (e: BaseSyntheticEvent) => void;
  noValidate?: boolean;
};

function Form(props: Props) {
  const { children, onSubmit, noValidate = true, ...otherProps } = props;
  const { trackSubmitForm } = useTrackFormEvent();
  const handleSubmit = (e: BaseSyntheticEvent) => {
    onSubmit(e);
    trackSubmitForm(e);
  };

  return (
    <form onSubmit={handleSubmit} {...otherProps} noValidate={noValidate}>
      {children}
    </form>
  );
}

export default Form;
