import {
  registerDecorator, ValidationOptions,
} from 'class-validator';

import * as Constraints from 'Common/directives/GraphqlDirective/Constraints';
// eslint-disable-next-line import/no-extraneous-dependencies

const MongoId = (validationOptions?: ValidationOptions) => (object: unknown, propertyName: string): void => {
  const MongoIdConstraint = new Constraints.MongoIdConstraint();
  registerDecorator({
    name: MongoIdConstraint.getName(),
    target: object.constructor,
    propertyName,
    constraints: [],
    options: {
      message: MongoIdConstraint.getErrorMessage(propertyName),
      ...validationOptions,
    },
    validator: {
      validate(value: string): boolean {
        return MongoIdConstraint.validate(value);
      },
    },
  });
};

const UUID = (validationOptions?: ValidationOptions) => (object: unknown, propertyName: string): void => {
  const UUIDConstraint = new Constraints.UUIDConstraint();
  registerDecorator({
    name: UUIDConstraint.getName(),
    target: object.constructor,
    propertyName,
    constraints: [],
    options: {
      message: UUIDConstraint.getErrorMessage(propertyName),
      ...validationOptions,
    },
    validator: {
      validate(value: string): boolean {
        return UUIDConstraint.validate(value);
      },
    },
  });
};

export { MongoId, UUID };
