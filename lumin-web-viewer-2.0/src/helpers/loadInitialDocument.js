import getHashParams from 'helpers/getHashParams';
import loadDocument from 'helpers/loadDocument';

export default (dispatch) => {
  const doesAutoLoad = getHashParams('auto_load', true);
  const initialDoc = getHashParams('d', '');
  const startOffline = getHashParams('startOffline', false);

  if ((initialDoc && doesAutoLoad) || startOffline) {
    const options = {
      extension: getHashParams('extension', null),
      filename: getHashParams('filename', null),
      externalPath: getHashParams('p', ''),
      documentId: getHashParams('did', null),
    };

    loadDocument({
      dispatch,
      src: initialDoc,
      options,
    });
  }
};
