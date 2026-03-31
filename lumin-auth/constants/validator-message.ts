/* eslint-disable class-methods-use-this */

import { ValidatorRule } from '@/constants/validator-rule';

export class ValidatorMessage {
  static Common = {
    MaxLength: (length: number) => ({ key: 'errorMessage.maxLengthMessage', interpolation: { length } }),
    MinLength: (length: number) => ({ key: 'errorMessage.minLengthMessage', interpolation: { length } }),
    FieldRequired: 'errorMessage.fieldRequired',
    InvalidField: 'errorMessage.invalidField'
  };

  static readonly Email = {
    MaxLength: this.Common.MaxLength(ValidatorRule.Email.MaxLength)
  };

  static readonly Username = {
    MaxLength: this.Common.MaxLength(ValidatorRule.Username.MaxLength),
    NotContainUrl: 'errorMessage.notContainUrl'
  };

  static readonly Password = {
    MinLength: { key: 'errorMessage.passwordMustHaveAtLeastCharacters', interpolation: { length: ValidatorRule.Password.MinLength } },
    MaxLength: { key: 'errorMessage.passwordMustHaveNoMoreThanCharacters', interpolation: { length: ValidatorRule.Password.MaxLength } }
  };

  static readonly Terms = {
    Required: 'errorMessage.tnc'
  };
}
