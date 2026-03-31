/* eslint-disable */
import { GraphQLList, GraphQLNonNull, GraphQLNullableType, GraphQLScalarType, ListValueNode } from 'graphql';
import { ValidationType } from 'Common/directives/GraphqlDirective/ValidationType';
import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { ErrorCode } from 'Common/constants/ErrorCode';

class ArrayScalarType extends GraphQLScalarType {
  constructor(type, constraint: InterfaceConstraint) {
    super({
      name: `${constraint.getName()}`,
      description: 'Scalar type wrapper for input validation',
      serialize(value: unknown[]) {
        const serializer = type.serialize || type.ofType.serialize;
        return value.map(serializer);
      },
      parseValue(value: unknown[]) {
        if (!constraint.validate(value)) {
          throw GraphErrorException.UnprocessableError(constraint.getErrorMessage(value), ErrorCode.Common.INVALID_INPUT);
        }
        const parser = type.parseValue || type.ofType.parseValue;
        return value.map(parser);
      },
      parseLiteral(valueNode: ListValueNode, variables?) {
        const values = valueNode.values.map((node) => (node as any).value);
        if (!constraint.validate(values)) {
          throw GraphErrorException.UnprocessableError(constraint.getErrorMessage(values), ErrorCode.Common.INVALID_INPUT);
        }
        // TODO: If we need to use parseLiteral, modify this `parseLiteral` with parser by ofType
        const parser = type.parseLiteral || type.ofType.parseLiteral || type.ofType.ofType.parseLiteral;
        const parsedValue = valueNode.values.map((value) => parser(value, variables));
        return parsedValue;
      },
    });
  }
}

export class ValidationListType extends GraphQLList<any> {
  constructor(ofType) {
    super(ofType);
  }
  static create(type, constraint: InterfaceConstraint) {
    if (type instanceof GraphQLNonNull
        && type.ofType instanceof GraphQLList) {
      const scalarType = ValidationType.create(type.ofType.ofType, constraint);
      return new GraphQLNonNull(new this(scalarType) as GraphQLNullableType);
    }

    if (type instanceof GraphQLList) {
      const scalarType = ValidationType.create(type.ofType, constraint);
      return new this(scalarType);
    }

    throw GraphErrorException.InternalServerError(`Type ${type} cannot be validated. Only graphql list are accepted`)
  }

  static createArrayType(type, constraint: InterfaceConstraint) {
    if (type instanceof GraphQLNonNull
      && type.ofType instanceof GraphQLList && type.ofType.ofType instanceof GraphQLNonNull) {
      return new ArrayScalarType(type.ofType.ofType.ofType, constraint);
    }
    if (type instanceof GraphQLList
      && type.ofType instanceof GraphQLNonNull) {
      return new ArrayScalarType(new GraphQLNonNull(type.ofType.ofType), constraint);
    }
    if (type instanceof GraphQLList) {
      return new ArrayScalarType(type.ofType, constraint);
    }
    if (type instanceof GraphQLNonNull) {
      return new ArrayScalarType(new GraphQLNonNull(type.ofType), constraint);
    }
    throw GraphErrorException.InternalServerError(`Type ${type} cannot be validated. Only graphql list are accepted`)
  }
}
