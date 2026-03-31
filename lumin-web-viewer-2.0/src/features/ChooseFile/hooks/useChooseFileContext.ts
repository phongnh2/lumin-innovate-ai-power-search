import { useContext } from 'react';

import { ChooseFileContext } from '../contexts/ChooseFile.context';

const useChooseFileContext = () => useContext(ChooseFileContext);

export default useChooseFileContext;
