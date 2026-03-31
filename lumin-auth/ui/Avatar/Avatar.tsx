import { Colors } from '../theme';

import { AvatarSize } from './Avatar.enum';
import { TAvatarProps } from './interfaces';
import { getTextAvatar, hashColorFromUserName } from './utils';

import * as Styled from './Avatar.styled';

function Avatar({ size = AvatarSize.MD, remotePath, src: srcProp, name, className, variant, ...props }: TAvatarProps) {
  const src = remotePath || srcProp;
  const textAvatar = getTextAvatar(name ?? '');
  const getBackgroundColor = () => (typeof textAvatar === 'string' ? hashColorFromUserName(textAvatar) : Colors.NEUTRAL_20);
  return (
    <Styled.Container src={src} size={size} className={className} backgroundcolor={getBackgroundColor()} variant={variant} {...props}>
      <Styled.NameText>{textAvatar}</Styled.NameText>
    </Styled.Container>
  );
}

export default Avatar;
