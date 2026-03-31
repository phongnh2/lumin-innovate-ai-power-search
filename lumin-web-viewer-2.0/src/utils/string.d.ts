declare namespace stringUtils {
  export function escapeSelector(selector: string): string;
  export function isIgnoreCaseEqual(str1: string, str2: string): boolean;
  export function getShortenStringNotification(str: string): string;
  export function getShortStringWithLimit(str: string, limit: number): string;
}

export default stringUtils;