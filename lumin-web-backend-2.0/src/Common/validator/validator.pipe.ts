/* eslint-disable @typescript-eslint/ban-types */
import {
  PipeTransform, Injectable, ArgumentMetadata,
} from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { HttpErrorException } from 'Common/errors/HttpErrorException';

@Injectable()
export class ValidationPipeRest implements PipeTransform<unknown> {
  private _transform: boolean;

  constructor({ transform }: { transform?: boolean } = { transform: false }) {
    this._transform = transform;
  }

  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object: Record<string, unknown> = plainToClass(metatype, value);
    const errors = await validate(object, { whitelist: true, stopAtFirstError: true, enableDebugMessages: true });
    if (errors.length > 0) {
      // eslint-disable-next-line no-console
      throw HttpErrorException.InternalServerError(errors[0]?.toString());
    }
    return this._transform ? object : value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
