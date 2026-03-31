import { PLATFORM, PlatformType } from 'screens/OpenLumin/constants';

const asyncFind = async <T>(arr: T[], predicate: (e: T) => Promise<boolean>): Promise<T | null> => {
  // eslint-disable-next-line no-restricted-syntax
  for (const e of arr) {
    // eslint-disable-next-line no-await-in-loop
    if (await predicate(e)) {
      return e;
    }
  }
  return null;
};

interface DocumentFile {
  fileHandle?: FileHandle;
  filePath?: string;
  platform?: PlatformType;
}

interface FileHandle {
  isSameEntry(file: FileHandle): Promise<boolean>;
}

export async function findFileEntry(inputArr: DocumentFile[], validatedFile: FileHandle): Promise<DocumentFile | null> {
  return asyncFind(inputArr, async (document: DocumentFile) => {
    if (document.platform === 'electron') {
      return false;
    }

    if (document.fileHandle) {
      return document.fileHandle.isSameEntry(validatedFile);
    }

    return false;
  });
}

export async function findElectronFileEntry(inputArr: DocumentFile[], filePath: string): Promise<DocumentFile | null> {
  return asyncFind(inputArr, (document: DocumentFile) =>
    Promise.resolve(document.platform === PLATFORM.ELECTRON && document.filePath === filePath)
  );
}
