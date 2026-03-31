import { useContext } from 'react';

import { TransferDocumentContext } from 'lumin-components/TransferDocument/context';

import { ITransferDocumentContext } from '../interfaces/TransferDocument.interface';

const useTransferDocumentContext = (): ITransferDocumentContext => useContext<ITransferDocumentContext>(TransferDocumentContext);

export default useTransferDocumentContext;
