import mime from 'mime';

export default {
  ...mime,
  lookup: mime.getType,
  extension: mime.getExtension,
};
