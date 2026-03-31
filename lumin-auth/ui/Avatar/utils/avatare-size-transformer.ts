import { SizeTransformer } from '../../utils/size-transformer';
import { AvatarSize } from '../Avatar.enum';

import { getAvatarSize } from './avatar-size';

export class AvatarSizeTransformer extends SizeTransformer<AvatarSize> {
  // eslint-disable-next-line class-methods-use-this
  transformer<TResult>({ size }: { size: AvatarSize }): TResult {
    return getAvatarSize({ size }) as unknown as TResult;
  }
}
