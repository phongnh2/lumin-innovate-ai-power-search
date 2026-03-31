import { isValidElement, ReactElement } from 'react';

import { Colors } from '@/ui/theme';

import Icomoon from '../../Icomoon';

interface IProps {
  onClear: (() => void) | undefined;
  showClearButton?: boolean;
  iconRight?: ReactElement | string | false;
}

function IconRight({ onClear, showClearButton, iconRight }: IProps) {
  if (showClearButton) {
    return (
      <span onClick={onClear} role='button' tabIndex={-1} style={{ cursor: 'pointer', padding: '4px' }}>
        <Icomoon type='cancel' size={12} color={Colors.NEUTRAL_60} />
      </span>
    );
  }

  if (!iconRight) {
    return null;
  }

  if (isValidElement(iconRight)) {
    return iconRight;
  }
  return <Icomoon type={String(iconRight)} size={16} />;
}

IconRight.defaultProps = {
  showClearButton: false,
  iconRight: undefined
};

export default IconRight;
