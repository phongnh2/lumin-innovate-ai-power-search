import AppleIcon from '../images/logo-apple.svg';
import { TIconButtonProps } from '../interfaces';

import * as Styled from './styled';

function Apple(props: Omit<TIconButtonProps, 'icon'>) {
  return <Styled.AppleIcon {...props} icon={<AppleIcon />} />;
}

export default Apple;
