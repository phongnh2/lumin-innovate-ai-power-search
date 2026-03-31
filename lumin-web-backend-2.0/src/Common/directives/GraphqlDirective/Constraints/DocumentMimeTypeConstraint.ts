/* eslint-disable import/no-extraneous-dependencies */
import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { SUPPORTED_MIME_TYPE } from 'Common/constants/DocumentConstants';

export class DocumentMimeTypeConstraint implements InterfaceConstraint {
  constructor(private readonly options: Record<string, unknown>, private readonly fieldName: string) {}

  getName(): string {
    return 'DocumentMimeTypeConstraint';
  }

  getErrorMessage(): string {
    return `${this.fieldName} - MimeType must be in ${SUPPORTED_MIME_TYPE.join(', ')}`;
  }

  validate(value: string): boolean {
    return SUPPORTED_MIME_TYPE.includes(value);
  }

  parse(value: any): any {
    return value;
  }
}
