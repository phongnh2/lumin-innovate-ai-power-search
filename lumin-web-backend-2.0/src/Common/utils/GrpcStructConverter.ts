enum FieldName {
  Number = 'numberValue',
  String = 'stringValue',
  Boolean = 'boolValue',
  Null = 'nullValue',
  List = 'listValue',
  Struct = 'structValue',
}

export default class GrpcStructConverter {
  private static readonly nullFieldValue = 0;

  private static readonly typeofFieldNameMap: Record<string, FieldName> = {
    number: FieldName.Number,
    string: FieldName.String,
    boolean: FieldName.Boolean,
  };

  private static readonly baseFieldNameConstructorMap: Partial<Record<FieldName, (val: any) => any>> = {
    [FieldName.Number]: Number,
    [FieldName.String]: String,
    [FieldName.Boolean]: Boolean,
  };

  private static isObject(obj: any): boolean {
    return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
  }

  public static serialize(val: any, sub = false): any {
    if (val === null || val === undefined) {
      return {
        [FieldName.Null]: this.nullFieldValue,
      };
    }

    const typeofVal = typeof val;
    if (Object.keys(this.typeofFieldNameMap).includes(typeofVal)) {
      return {
        [this.typeofFieldNameMap[typeofVal]]: val,
      };
    }

    if (Array.isArray(val)) {
      const out = {
        [FieldName.List]: {
          values: [],
        },
      };

      val.forEach((valItem) => {
        const itemVal = this.serialize(valItem, true);
        out[FieldName.List].values.push(itemVal);
      });

      return out;
    }

    if (typeofVal === 'object') {
      const out = sub ? {
        [FieldName.Struct]: {
          fields: {},
        },
      } : {
        fields: {},
      };

      Object.keys(val as Record<string, any>).forEach((field) => {
        if (val[field] === undefined) {
          return;
        }

        if (sub) {
          out[FieldName.Struct].fields[field] = this.serialize(val[field], true);
        } else {
          out.fields[field] = this.serialize(val[field], true);
        }
      });

      return out;
    }

    return undefined;
  }

  public static deserialize(val: any, sub = false): any {
    if (sub === false && !this.isObject(val?.fields)) {
      throw new Error('Invalid Struct format. Object must include "fields" property');
    }

    const fieldName = Object.keys(val as Record<string, any>)[0];
    if ((fieldName as FieldName) === FieldName.Null) {
      return null;
    }

    const baseValueTypeConstructor = this.baseFieldNameConstructorMap[fieldName as FieldName];
    if (baseValueTypeConstructor) {
      return baseValueTypeConstructor(val[fieldName]);
    }

    if ((fieldName as FieldName) === FieldName.List) {
      const listData = val[fieldName];
      if (listData?.values && Array.isArray(listData.values)) {
        return (listData.values as any[]).map((listValue: any) => this.deserialize(listValue, true));
      }
      return [];
    }

    if ((fieldName as FieldName) === FieldName.Struct) {
      return this.deserialize(val[fieldName], true);
    }

    if (this.isObject(val.fields)) {
      const result: Record<string, any> = {};
      Object.keys(val.fields as Record<string, any>).forEach((fieldKey) => {
        result[fieldKey] = this.deserialize(val.fields[fieldKey], true);
      });
      return result;
    }

    return undefined;
  }
}
