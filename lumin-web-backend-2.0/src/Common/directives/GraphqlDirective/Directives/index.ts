/* eslint-disable max-len */

import { setDirective } from './Directive';
import {
  DocumentMimeTypeConstraint,
  EmailConstraint,
  HexColorConstraint,
  LengthConstraint,
  MaxLengthConstraint,
  MongoIdConstraint,
  NotIncludesConstraint,
  PasswordConstraint,
  RangeConstraint,
  RegexConstraint,
  OneOfConstraint,
  UUIDConstraint,
} from '../Constraints';
import { createMaskPaymentFieldDirectiveTransformer } from './mask-payment-field.directive';
import { ArrayConstraint } from '../Constraints/ArrayConstraint';

// eslint-disable-next-line no-shadow
export enum DirectiveName {
  Array = 'Array',
  MongoId = 'MongoId',
  IsHexColor = 'IsHexColor',
  Range = 'Range',
  IsEmail = 'IsEmail',
  Length = 'Length',
  MaxLength = 'MaxLength',
  Regex = 'Regex',
  NotIncludes = 'NotIncludes',
  Password = 'Password',
  DocumentMimeType = 'DocumentMimeType',
  OneOf = 'OneOf',
  UUID = 'UUID',
}

export const directiveTransformers = [
  setDirective(DirectiveName.MongoId, MongoIdConstraint).transformer,
  setDirective(DirectiveName.IsHexColor, HexColorConstraint).transformer,
  setDirective(DirectiveName.Range, RangeConstraint).transformer,
  setDirective(DirectiveName.IsEmail, EmailConstraint).transformer,
  setDirective(DirectiveName.Length, LengthConstraint).transformer,
  setDirective(DirectiveName.MaxLength, MaxLengthConstraint).transformer,
  setDirective(DirectiveName.Regex, RegexConstraint).transformer,
  setDirective(DirectiveName.NotIncludes, NotIncludesConstraint).transformer,
  setDirective(DirectiveName.Password, PasswordConstraint).transformer,
  setDirective(DirectiveName.DocumentMimeType, DocumentMimeTypeConstraint).transformer,
  setDirective(DirectiveName.Array, ArrayConstraint).transformer,
  setDirective(DirectiveName.OneOf, OneOfConstraint).transformer,
  setDirective(DirectiveName.UUID, UUIDConstraint).transformer,
  createMaskPaymentFieldDirectiveTransformer(),
];
