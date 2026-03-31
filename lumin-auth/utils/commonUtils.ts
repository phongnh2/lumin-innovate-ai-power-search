export const isClientSide = () => typeof window !== 'undefined';

export const convertToSnakeCase = (str: string): string =>
  str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();

export const truncateObject = (obj: Record<string, string>, maxKeyLength: number, maxValueLength: number) => {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const truncatedKey = key.length > maxKeyLength ? key.slice(0, maxKeyLength) : key;
    const truncatedValue = value.length > maxValueLength ? value.slice(0, maxValueLength) : value;
    return { ...acc, [truncatedKey]: truncatedValue };
  }, {});
};

export const toSnakeCaseKeys = (obj: Record<string, unknown>): Record<string, unknown> => {
  return (
    (obj &&
      Object.keys(obj).reduce((accumulator, key) => {
        accumulator[convertToSnakeCase(key)] = obj[key];
        return accumulator;
      }, {} as Record<string, unknown>)) ||
    {}
  );
};
