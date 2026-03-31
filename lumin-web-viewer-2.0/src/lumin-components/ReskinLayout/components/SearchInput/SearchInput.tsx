import classNames from 'classnames';
import { TextInput, TextInputProps, Icomoon, PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React, { useMemo, forwardRef, Ref } from 'react';

import { TOOLTIP_MAX_WIDTH, TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';

import styles from './SearchInput.module.scss';

interface BadgeProps {
  content: string;
  active: boolean;
  showTooltip?: boolean;
  tooltipContent?: string;
}

interface SearchInputProps extends Omit<TextInputProps, 'leftSection'> {
  badgeProps?: BadgeProps;
}

const defaultBadgeProps: BadgeProps = {
  content: '',
  active: false,
  showTooltip: false,
  tooltipContent: '',
};

const SearchInput = forwardRef(
  ({ className, badgeProps, ...otherProps }: SearchInputProps, ref: Ref<HTMLInputElement>) => {
    const { content, active, showTooltip, tooltipContent } = badgeProps || defaultBadgeProps;

    const badgeComponent = useMemo(() => {
      if (active) {
        return (
          <PlainTooltip
            disabled={!showTooltip}
            content={tooltipContent || content}
            position="bottom"
            openDelay={TOOLTIP_OPEN_DELAY}
            maw={TOOLTIP_MAX_WIDTH}
          >
            <div className={styles.badgeWrapper}>
              <Icomoon type="search-md" size="md" />
              <Text ellipsis size="md" type="label">
                {content}
              </Text>
            </div>
          </PlainTooltip>
        );
      }
      return <Icomoon type="search-lg" size="lg" />;
    }, [active, content, tooltipContent, showTooltip]);

    return (
      <TextInput
        ref={ref}
        type="search"
        className={classNames(styles.focusedInput, active && styles.badgeActive, className)}
        leftSection={badgeComponent}
        {...otherProps}
      />
    );
  }
);

export default SearchInput;
