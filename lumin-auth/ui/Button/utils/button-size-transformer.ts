import { ButtonSize, getButtonSize } from '../types';
import { IResponsiveSize, SizeTransformer } from '../../utils/size-transformer';

export type IButtonSize = ButtonSize | IResponsiveSize<ButtonSize>;

export class ButtonSizeTransformer extends SizeTransformer<ButtonSize> {
  // eslint-disable-next-line class-methods-use-this
  transformer<TResult>(data: unknown): TResult {
    return getButtonSize(data as { size: ButtonSize }) as unknown as TResult;
  }
}
