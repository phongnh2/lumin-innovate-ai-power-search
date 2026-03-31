import { useContext } from 'react';

import { ReadDocumentContext } from '../context/ReadDocumentContext';

export const useReadAloudContext = () => useContext(ReadDocumentContext);
