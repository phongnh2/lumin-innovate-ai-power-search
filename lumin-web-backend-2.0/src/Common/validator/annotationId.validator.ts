import { registerDecorator, ValidationOptions } from 'class-validator';

const IsAnnotationId = (validationOptions?: ValidationOptions) => (object: unknown, propertyName: string): void => {
  registerDecorator({
    name: 'IsAnnotationId',
    target: object.constructor,
    propertyName,
    constraints: [],
    options: {
      ...validationOptions,
    },
    validator: {
      validate(value: string): boolean {
        if (typeof value !== 'string') {
          return false;
        }
        /*
          The value can be a UUID (36 characters), a MongoDB ObjectId (24 characters),
          a custom format `LUnique-${uuid}` (42 characters), or other PDF viewer system ID generators (256 characters)
        */
        return value.length <= 256;
      },
    },
  });
};

export { IsAnnotationId };
