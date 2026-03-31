const fileMock = new File([''], 'filename', { type: 'application/pdf' });
fileMock.arrayBuffer = function () {
  return Promise.resolve(true);
};
module.exports = fileMock;
