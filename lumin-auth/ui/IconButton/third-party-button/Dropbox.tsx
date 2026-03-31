import DropboxIcon from '../images/logo-dropbox.svg';
import { TIconButtonProps } from '../interfaces';

import * as Styled from './styled';

function Dropbox(props: Omit<TIconButtonProps, 'icon'>) {
  return <Styled.DropboxIcon {...props} icon={<DropboxIcon />} />;
}

export default Dropbox;
