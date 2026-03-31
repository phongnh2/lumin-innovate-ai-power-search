const defaultOptions = {
  separator: ' ',
  digits: 1,
};

const formatString = (options) => (number, unit) => `${number}${options.separator}${unit}`;
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

export default function bytesToSize(bytes, options = defaultOptions) {
  const newOptions = { ...defaultOptions, ...options };

  if (bytes === 0) return formatString(newOptions)(0, sizes[1]);

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);

  if (i === 0) return formatString(newOptions)(bytes, sizes[i]);

  return formatString(newOptions)((bytes / (1024 ** i)).toFixed(newOptions.digits), sizes[i]);
}
