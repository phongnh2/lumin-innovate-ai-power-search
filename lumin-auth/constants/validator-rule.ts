/* eslint-disable class-methods-use-this */

export class ValidatorRule {
  static readonly Email = {
    MaxLength: 255
  };

  static readonly Username = {
    MaxLength: 32
  };

  static readonly Password = {
    MinLength: 8,
    /**
     * @reference https://www.ory.sh/docs/self-hosted/kratos/configuration/password
     */
    MaxLength: 72
  };

  static readonly Avatar = {
    MaximumAvatarSize: 5 * 1024 * 1024
  };
}
