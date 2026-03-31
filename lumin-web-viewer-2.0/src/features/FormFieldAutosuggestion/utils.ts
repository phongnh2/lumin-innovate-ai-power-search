import Fuse from 'fuse.js';

export const DATA_IDENTITY = 'form-field-autocomplete-item';

export const MAX_CHARACTERS_LENGTH = 255;

export const MIN_CHARACTERS_LENGTH = 3;

export const isAutocompleteItem = (element: Element): boolean =>
  element instanceof window.HTMLLIElement && element.getAttribute('data-identity') === DATA_IDENTITY;

export function getNextWrappingIndex(moveAmount: number, baseIndex: number, itemCount: number): number {
  if (itemCount === 0) {
    return -1;
  }

  const itemsLastIndex = itemCount - 1;

  if (typeof baseIndex !== 'number' || baseIndex < 0 || baseIndex >= itemCount) {
    baseIndex = moveAmount > 0 ? -1 : itemsLastIndex + 1;
  }

  let newIndex = baseIndex + moveAmount;

  if (newIndex < 0) {
    newIndex = itemsLastIndex;
  } else if (newIndex > itemsLastIndex) {
    newIndex = 0;
  }
  return newIndex;
}

export const fuseSortFn: Fuse.FuseSortFunction = (a, b) => {
  if (a.score === b.score) {
    return a.item < b.item ? -1 : 1;
  }
  return a.score < b.score ? -1 : 1;
};