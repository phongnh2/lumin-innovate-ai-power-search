export default (content, commonStyle = {}) => {
  const richTextCssStyleObj = { 0: commonStyle };
  const contentLength = content.length;
  for (let i = 0; i < contentLength; i++) {
    if (content[i] === '\n') {
      richTextCssStyleObj[i] = {};
      richTextCssStyleObj[i + 1] = commonStyle;
    }
  }
  richTextCssStyleObj[contentLength] = {};
  return richTextCssStyleObj;
};
