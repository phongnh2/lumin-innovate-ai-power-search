import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('StringOrInt')
export class StringOrIntScalar implements CustomScalar<number | string, number | string> {
  description = 'String or Int custom scalar type';

  parseValue(value): string | number {
    // Implement your parsing logic here
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
    throw new Error('StringOrInt must be a string or an integer');
  }

  serialize(value): string | number {
    return value;
  }

  parseLiteral(ast: ValueNode): string | number {
    switch (ast.kind) {
      case Kind.STRING:
        return ast.value;
      case Kind.INT:
        return parseInt(ast.value, 10);
      default:
        throw new Error('StringOrInt must be a string or an integer');
    }
  }
}
