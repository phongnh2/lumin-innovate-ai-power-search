import {
  registerDecorator, ValidationOptions,
} from 'class-validator';
import { JSDOM } from 'jsdom';

const IsXml = (validationOptions?: ValidationOptions) => (object: unknown, propertyName: string): void => {
  registerDecorator({
    name: 'IsXml',
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
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, no-new
          new JSDOM(value, { contentType: 'text/xml' });
          return true;
        } catch (error) {
          return false;
        }
      },
    },
  });
};

export { IsXml };
