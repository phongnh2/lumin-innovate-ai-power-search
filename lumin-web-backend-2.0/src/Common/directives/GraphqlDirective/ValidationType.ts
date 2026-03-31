/* eslint-disable */
import { GraphQLScalarType, GraphQLNonNull, parseValue } from 'graphql';
import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { ErrorCode } from 'Common/constants/ErrorCode';

export class ValidationType extends GraphQLScalarType {
  static create(type, constraint: InterfaceConstraint) {
    if (type instanceof GraphQLNonNull
        && type.ofType instanceof GraphQLScalarType) {
      return new GraphQLNonNull(new this(type.ofType, constraint));
    }

    if (type instanceof GraphQLScalarType) {
      return new this(type, constraint);
    }

    throw GraphErrorException.UnprocessableError(`Type ${type} cannot be validated. Only scalars are accepted`)
  }

  private constructor(type, constraint: InterfaceConstraint) {
    super({
      name: `${constraint.getName()}`,
      description: 'Scalar type wrapper for input validation',
      serialize(value) {
        return type.serialize(value);
      },
      parseValue(value) {
        const parsedValue = type.parseValue(value);

        if (!constraint.validate(parsedValue)) {
          throw GraphErrorException.UnprocessableError(constraint.getErrorMessage(parsedValue), ErrorCode.Common.INVALID_INPUT);
        }

        return constraint.parse(parsedValue);
      },
      parseLiteral(valueNode, variables?) {
        const parsedValue = type.parseLiteral(valueNode, variables);

        if (!constraint.validate(parsedValue)) {
          throw GraphErrorException.UnprocessableError(constraint.getErrorMessage(parsedValue), ErrorCode.Common.INVALID_INPUT);
        }

        return constraint.parse(parsedValue);
      },
    });
  }
}
