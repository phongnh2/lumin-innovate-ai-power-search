declare namespace numberUtils {
  export function formatTwoDigits(number: number): string;
  export function formatDecimal(number: number): string;
  export function formatTwoDigitsDecimal(amount: number | string): string;
}

export default numberUtils;
