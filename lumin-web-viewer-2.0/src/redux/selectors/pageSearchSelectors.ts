/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { RootState } from 'store';

export const getPageSearchData = (state: RootState) =>
  state.pageSearch as { searchKey: string; isFocusing: boolean; findDocumentByName: boolean };
