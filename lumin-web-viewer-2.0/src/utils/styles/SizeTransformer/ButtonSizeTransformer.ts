/* eslint-disable class-methods-use-this */
import { ButtonSize, getButtonSize } from 'luminComponents/ButtonMaterial/types/ButtonSize';
import { IResponsiveSize, SizeTransformer } from 'utils/styles/SizeTransformer/SizeTransformer';

export type IButtonSize = ButtonSize | IResponsiveSize<ButtonSize>;

export class ButtonSizeTransformer extends SizeTransformer<ButtonSize> {
  transformer<TResult>(data: unknown): TResult {
    return getButtonSize(data as { size: string }) as unknown as TResult;
  }
}
