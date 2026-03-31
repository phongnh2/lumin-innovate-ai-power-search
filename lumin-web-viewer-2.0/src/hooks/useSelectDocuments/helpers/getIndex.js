import { findIndex } from 'lodash';

export default (documentList, document) => findIndex(documentList, { _id: document._id });
