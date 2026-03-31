/* eslint-disable new-cap */
/* eslint-disable no-restricted-syntax */
import {
  GraphQLArgument,
  GraphQLNonNull,
  GraphQLList,
  GraphQLSchema,
  GraphQLInputFieldConfig,
} from 'graphql';
import { getDirective, mapSchema, MapperKind } from '@graphql-tools/utils';
import { ValidationType } from 'Common/directives/GraphqlDirective/ValidationType';
import { ValidationListType } from 'Common/directives/GraphqlDirective/ValidationListType';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { InterfaceConstraint } from '../Constraints/InterfaceConstraint';
import { DirectiveName } from '.';

class Directive {
  constructor(private readonly constraint: new (params: Record<string, unknown>, fieldName: string, typeName?: string) => InterfaceConstraint) {}

  transformInputFieldDefinition(
    argument: GraphQLArgument | GraphQLInputFieldConfig,
    typeName: string,
    fieldName: string,
    params: Record<string, unknown>,
    directiveName: string,
  ) {
    if (directiveName === DirectiveName.Array) {
      return ValidationListType.createArrayType(argument.type, new this.constraint(params, fieldName));
    }
    if (argument.type instanceof GraphQLList
      || (argument.type instanceof GraphQLNonNull && argument.type.ofType instanceof GraphQLList)) {
      return ValidationListType.create(argument.type, new this.constraint(params, fieldName));
    }
    return ValidationType.create(argument.type, new this.constraint(params, fieldName, typeName));
  }

  validateArgumentDefinition(value: unknown, options: Record<string, unknown>, fieldName: string) {
    const constraint = new this.constraint(options, fieldName);
    if (!constraint.validate(value)) {
      throw GraphErrorException.UnprocessableError(constraint.getErrorMessage(value), ErrorCode.Common.INVALID_INPUT);
    }
  }
}

export function setDirective(directiveName: string, constraints: new (params: Record<string, unknown>, fieldName: string) => InterfaceConstraint) {
  return {
    transformer: (schema: GraphQLSchema) => mapSchema(schema, {
      [MapperKind.FIELD]: (argument: GraphQLInputFieldConfig, fieldName, typeName) => {
        const params = getDirective(schema, argument, directiveName)?.[0] as Record<string, unknown>;
        if (params) {
          argument.type = new Directive(constraints).transformInputFieldDefinition(argument, typeName, fieldName, params, directiveName) as any;
        }
        return argument;
      },
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        // try to get Field from fieldName
        if (fieldConfig.args != null) {
          // TODO recursively check arguments and wrap resolver function
          for (const [_name, field] of Object.entries(fieldConfig.args)) {
            const _node = field.astNode?.directives?.find((directive) => directive.name.value === directiveName);
            if (_node) {
              return {
                ...fieldConfig,
                resolve: (root, args, context, info) => {
                  const key = (_node.arguments.find((arg) => arg.name.value === 'key').value as any).value as string;
                  const options = _node.arguments.filter(
                    (arg) => arg.name.value !== 'key',
                  ).reduce((current, next) => ({ ...current, [next.name.value]: (next.value as any).value }), {});
                  new Directive(constraints).validateArgumentDefinition(args[key], options, key);
                  return fieldConfig.resolve?.(root, args, context, info);
                },
              };
            }
          }
          return fieldConfig;
        }

        return fieldConfig;
      },
    }),
  };
}
