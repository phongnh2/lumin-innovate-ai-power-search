import { produce } from 'immer';

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

/**
 * Update only keys in target that exist in source
 */
function updateSharedKeys(target, source) {
  return produce(target, (draft) => {
    Object.keys(source).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(draft, key)) {
        draft[key] = source[key];
      }
    });
  });
}

export {
  isObject,
  mergeDeep,
  updateSharedKeys,
};
