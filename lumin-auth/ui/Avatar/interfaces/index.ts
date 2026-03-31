import { IResponsiveSize } from '../../utils';
import { AvatarSize } from '../Avatar.enum';

export type TAvatarSize = AvatarSize | number | undefined;

export type TAvatarProps = {
  className?: string | undefined;
  remotePath?: string | undefined;
  src?: string | undefined;
  name?: string | undefined;
  size?: TAvatarSize | IResponsiveSize<TAvatarSize>;
  variant?: 'circular' | 'rounded' | 'square';
};
