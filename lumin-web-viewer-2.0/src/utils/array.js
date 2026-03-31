function removeElementFromArrayByIndex({ array, removeIndex }) {
  if (removeIndex > array.length || removeIndex < 1) {
    return array;
  }
  return [...array.slice(0, removeIndex - 1), ...array.slice(removeIndex, array.length)];
}

function compareStringArray(firstArray, secondArray) {
  if (firstArray.length !== secondArray.length) {
    return false;
  }
  return firstArray.every((element, index) => element === secondArray[index]);
}

function removeByIndex(list, index) {
  return [
    ...list.slice(0, index),
    ...list.slice(index + 1),
  ];
}

function createRangeArray(start, end) {
  return Array(end - start + 1).fill().map((_, idx) => start + idx);
}

function removeElementsByRange({ array, from, to }) {
  if (from > array.length || from < 1 || to > array.length || to < from) {
    return array;
  }
  return [...array.slice(0, from - 1), ...array.slice(to, array.length)];
}

function reOrderItem({ array, from, to }) {
  const updatedPosition = [...array];
  const [movingItem] = updatedPosition.splice(from, 1);
  updatedPosition.splice(to, 0, movingItem);
  return updatedPosition;
};

function createFontsizeArray(start, end) {
  return Array(end - start + 1)
    .fill()
    .map((_, idx) => ({
      label: `${idx + 1}pt`,
      value: idx + 1,
    }));
}

export default {
  removeElementFromArrayByIndex,
  compareStringArray,
  removeByIndex,
  createRangeArray,
  removeElementsByRange,
  reOrderItem,
  createFontsizeArray,
};
