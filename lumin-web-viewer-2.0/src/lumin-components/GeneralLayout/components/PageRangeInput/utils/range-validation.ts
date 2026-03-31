export const rangeRegex = /^\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*$/;

/**
 * Validates the format of a range expression
 * Examples of valid formats: "1", "1-3", "1,3,5", "1-3,5,7-10"
 * @param value - The range string to validate
 * @returns true if format is valid or empty, false otherwise
 */
export const validateRangeFormatExpression = (value: string): boolean => !value || rangeRegex.test(value);
