import Icomoon from '../Icomoon';
import * as Styled from './styled';

interface ICheckboxIcon {
  checked?: boolean;
  indeterminate?: boolean;
  size?: number;
  disabled?: boolean;
}

function CheckboxIcon({ disabled = false, size = 16, indeterminate = false, checked = false, ...otherProps }: ICheckboxIcon) {
  return (
    <Styled.CheckboxIcon {...otherProps} checked={checked} disabled={disabled}>
      {checked && <Icomoon size={Math.floor(size / 1.4)} type={indeterminate ? 'minus' : 'check'} />}
    </Styled.CheckboxIcon>
  );
}

export default CheckboxIcon;
