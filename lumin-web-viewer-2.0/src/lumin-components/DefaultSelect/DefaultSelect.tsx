import classNamesUtil from 'classnames';
import { Select, SelectProps, Icomoon, ScrollAreaProps, mergeClassNames } from 'lumin-ui/kiwi-ui';
import React, { useState, useMemo, forwardRef, Ref } from 'react';

import styles from './DefaultSelect.module.scss';

type DefaultSelectProps = Omit<SelectProps, 'withScrollArea' | 'scrollAreaProps'> & {
  rightSectionColor?: string;
  scrollAreaProps?: ScrollAreaProps;
};

const DefaultSelect = forwardRef(
  (
    {
      rightSection,
      rightSectionColor = 'var(--kiwi-colors-surface-on-surface)',
      classNames,
      scrollAreaProps: { classNames: scrollAreaClassNames, ...otherScrollAreaProps } = {},
      searchable = false,
      ...otherProps
    }: DefaultSelectProps,
    ref: Ref<HTMLInputElement>
  ) => {
    const [dropdownOpened, setDropdownOpened] = useState(false);

    const mergedClassNames = useMemo(
      () =>
        mergeClassNames({
          baseClassNames: {
            dropdown: styles.dropdown,
            option: styles.option,
            wrapper: styles.wrapper,
            input: styles.input,
          },
          customClassNames: classNames,
        }),
      [classNames]
    );

    const defaultRightSection = useMemo(
      () => (
        <div
          className={classNamesUtil(styles.defaultRightSectionWrapper, {
            [styles.rotate180Deg]: dropdownOpened,
            [styles.rotateZeroDeg]: !dropdownOpened,
            [styles.rightSectionWithSearchable]: dropdownOpened && searchable,
          })}
        >
          <Icomoon type="chevron-down-md" size="md" color={rightSectionColor} />
        </div>
      ),
      [dropdownOpened, searchable, rightSectionColor]
    );

    const scrollAreaProps = useMemo(
      () =>
        ({
          mah: 'var(--kiwi-dropdown-popper-max-height)',
          type: 'auto',
          classNames: mergeClassNames({
            baseClassNames: {
              scrollbar: styles.scrollbar,
              thumb: styles.thumb,
              viewport: styles.viewport,
            },
            customClassNames: scrollAreaClassNames,
          }),
          offsetScrollbars: 'x',
          scrollbars: 'y',
          ...otherScrollAreaProps,
        } as ScrollAreaProps),
      [scrollAreaClassNames, otherScrollAreaProps]
    );

    return (
      <Select
        ref={ref}
        withScrollArea
        scrollAreaProps={scrollAreaProps}
        classNames={mergedClassNames}
        rightSection={rightSection || defaultRightSection}
        searchable={searchable}
        onDropdownOpen={() => setDropdownOpened(true)}
        onDropdownClose={() => setDropdownOpened(false)}
        {...otherProps}
      />
    );
  }
);

export default DefaultSelect;
