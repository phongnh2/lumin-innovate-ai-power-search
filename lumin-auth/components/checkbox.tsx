import classNames from 'classnames';
import Image from 'next/image';
import { ComponentPropsWithoutRef, ComponentPropsWithRef, forwardRef, ReactNode, useState } from 'react';

import tickIcon from '../public/assets/tick.svg';

export type CheckboxProps = {
  children: ReactNode;
  className?: string;
} & ComponentPropsWithRef<'input'>;
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, children, ...otherProps }, ref) => {
  const [checked, setChecked] = useState(false);

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label className={classNames(className, 'flex', otherProps.disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
      <Checkmark checked={checked || otherProps.defaultChecked} readOnly={otherProps.defaultChecked} />

      <input {...otherProps} className='invisible w-0 h-0' type='checkbox' onClick={() => setChecked(!checked)} ref={ref} />
      <p className='ml-[0.625rem]'>{children}</p>
    </label>
  );
});
Checkbox.displayName = 'Checkbox';

function Checkmark({
  checked,
  readOnly,
  ...otherProps
}: {
  checked: boolean | undefined;
  readOnly: boolean | undefined;
} & ComponentPropsWithoutRef<'div'>) {
  return (
    <div className='border border-neutral-20 rounded w-5 h-5 overflow-hidden' {...otherProps}>
      <div className={classNames('flex justify-center items-center h-full w-full', !checked && 'hidden', readOnly ? 'bg-primary2-50' : 'bg-neutral-100')}>
        <Image
          src={tickIcon}
          alt='checked'
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </div>
    </div>
  );
}

Checkbox.defaultProps = {
  className: undefined
};
