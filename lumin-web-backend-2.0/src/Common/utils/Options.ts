import { Production } from './Options/Production';
import { Development } from './Options/Development';
import { IOptions } from './Options/Option.interface';

export class Options {
  public static getOptions(): IOptions {
    if (process.env.LUMIN_ENV === 'production') {
      return new Production();
    }
    return new Development();
  }
}
