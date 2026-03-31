// eslint-disable-next-line import/no-cycle
import { RootState } from 'redux/store';

export const getDocumentTabType = (state: RootState) => {
  const { documentTabType } = state.general as { documentTabType: string };
  return documentTabType;
};
