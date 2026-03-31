import classNames from 'classnames';
import React, { ForwardedRef, forwardRef } from 'react';

export type TextLinkProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
};
function TextLinkWithoutRef<T extends React.ElementType = 'a'>(
  { as, className, ...otherProps }: TextLinkProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof TextLinkProps<T>>,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const Component = as ?? 'a';

  return <Component {...otherProps} ref={ref} className={classNames('text-secondary-50 underline text-sm font-semibold', className)} />;
}
export const TextLink = forwardRef(TextLinkWithoutRef) as typeof TextLinkWithoutRef;
