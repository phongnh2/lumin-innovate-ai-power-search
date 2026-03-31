export const sanitizeForEmailDisplay = (text: string) => text
  .replace(/\./g, '.\u200B')
  .replace(/:/g, ':\u200B')
  .replace(/\//g, '/\u200B');

export const sanitizeDataForEmail = (data: Record<string, any>) => {
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'string' && key.endsWith('Name')) {
      data[key] = sanitizeForEmailDisplay(data[key] as string);
    }
  });
  return data;
};
