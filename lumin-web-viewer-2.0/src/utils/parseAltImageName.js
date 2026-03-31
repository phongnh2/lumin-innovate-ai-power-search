function parseAltName (image) {
  const index = image.lastIndexOf('/');
  const result = image.substring(index + 1).split('.')[0];
  return result
}

export default {
  parseAltName
};