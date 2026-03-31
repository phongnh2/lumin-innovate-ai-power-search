import { isNumber } from 'lodash';

import { AvatarSize } from '../Avatar.enum';

export const avatarSizeMap = new Map([
  [AvatarSize.XXS, 32],
  [AvatarSize.XS, 36],
  [AvatarSize.SM, 40],
  [AvatarSize.MD, 44],
  [AvatarSize.LG, 48],
  [AvatarSize.XL, 64],
  [AvatarSize.XXL, 80]
]);

export const getAvatarSize = ({ size = AvatarSize.MD }: { size: AvatarSize }) => {
  if (isNumber(size)) {
    return size;
  }
  return avatarSizeMap.get(size);
};
