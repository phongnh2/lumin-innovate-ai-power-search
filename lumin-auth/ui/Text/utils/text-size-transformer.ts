import { SizeTransformer } from '../../utils/size-transformer';
import { TextLevel } from '../interfaces';

import textSizeMap from './text-size';

export class TextSizeTransformer extends SizeTransformer<TextLevel> {
  // eslint-disable-next-line class-methods-use-this
  transformer<TResult>({ size }: { size: TextLevel }): TResult {
    return textSizeMap.get(size) as unknown as TResult;
  }
}
