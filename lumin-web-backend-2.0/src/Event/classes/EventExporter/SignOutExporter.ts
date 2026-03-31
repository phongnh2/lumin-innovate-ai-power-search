import { SignInExporter } from 'Event/classes/EventExporter/SignInExporter';
import { ExportPrefixEnums } from 'Event/enums/event.enum';
import { User } from 'User/interfaces/user.interface';

export class SignOutExporter extends SignInExporter {
  constructor(user: User) {
    super(user);
    this.prefix = ExportPrefixEnums.SIGNED_OUT;
  }
}
