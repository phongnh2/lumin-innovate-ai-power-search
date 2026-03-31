import { CUSTOM_DATA_TEXT_TOOL } from 'constants/customDataConstant';

const exportNotesToTXT = ({ notesToExport, documentName }) => {
  let data = '';
  let currPage = '';
  let currIndexByPage = 1;
  notesToExport.forEach((item) => {
    if (currPage !== item.getPageNumber()) {
      currPage = item.getPageNumber();
      data += `[Page ${currPage}]\n`;
      currIndexByPage = 1;
    }
    data += `[Content of note ${currIndexByPage}]:${
      item.getContents() || item.getCustomData(CUSTOM_DATA_TEXT_TOOL.CONTENT.key) || ''
    }\n`;
    currIndexByPage += 1;
  });
  const fileName = `Notes for [${documentName}].txt`;

  const a = document.createElement('a');
  const json = data;
  const blob = new Blob([json], { type: 'octet/stream' });
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default exportNotesToTXT;
