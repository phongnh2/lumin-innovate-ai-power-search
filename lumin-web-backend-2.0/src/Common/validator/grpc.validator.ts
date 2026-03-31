import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { GrpcErrorException } from 'Common/errors/GrpcErrorException';

@Injectable()
export class GrpcValidationPipe implements PipeTransform<unknown> {
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object: Record<string, unknown> = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw GrpcErrorException.InvalidArgument(
        errors[0].toString(),
        'InvalidArgument',
      );
    }

    return value;
  }

  private toValidate(metatype: unknown): boolean {
    const types: unknown[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
