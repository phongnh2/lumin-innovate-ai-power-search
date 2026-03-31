declare namespace commonUtils {
  export function isVowel(word: string): boolean;

  export function getHOCDisplayName(HOCName: string, WrappedComponent: JSX.Element | React.ComponentType): string;

  export function formatTitleCaseByLocale(text: string): string;

  export function convertHexToDec(hexValue: string): number;

  export function getDomainFromEmail(email: string): string;

  export function changeDomainToUrl(email: string): string;

  export function replaceSpecialCharactersWithEscapse(id: string): string;
}

export function replaceSpecialCharactersWithEscapse(id: string): string;

export function formatTitleCaseByLocale(text: string): string;

export { commonUtils };

export default commonUtils;
