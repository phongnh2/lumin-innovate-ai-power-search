export default (xfdf) => {
  /* FIX CORE VERSION 8.6.1 */
  if (xfdf.includes('<appearance')) {
    const endingTag = '</appearance>';
    const begin = xfdf.indexOf('<appearance');
    const end = xfdf.indexOf(endingTag);
    xfdf = xfdf.replace(xfdf.slice(begin, end + endingTag.length), '');
  }
  /* */
  return xfdf;
};
