import { RootState } from 'store';

import { IFolder } from 'interfaces/folder/folder.interface';

export function getFolderList(state: RootState): { data: IFolder[] };

export function getCurrentFolder(state: RootState): IFolder | null;
