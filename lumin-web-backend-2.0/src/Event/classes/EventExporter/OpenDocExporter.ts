import { UploadDocExporter } from 'Event/classes/EventExporter/UploadDocExporter';
import { ExportPrefixEnums } from 'Event/enums/event.enum';
import { User } from 'User/interfaces/user.interface';

export class OpenDocExporter extends UploadDocExporter {
  constructor(user: User) {
    super(user);
    this.prefix = ExportPrefixEnums.OPENED_DOC;
  }
}
