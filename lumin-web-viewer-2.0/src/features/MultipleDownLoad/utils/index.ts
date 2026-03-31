import { MAX_LENGTH_DOCUMENT_NAME } from 'constants/documentConstants';

const addCounterToFolderName = (name: string, counter: number): string => `${name} (${counter})`;

const addCounterToFilename = (filename: string, counter: number): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${filename} (${counter})`;
  }

  const nameWithoutExtension = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex);
  return `${nameWithoutExtension} (${counter})${extension}`;
};

const truncateName = ({
  name,
  kind,
  maxLength = 240,
}: {
  name: string;
  kind: 'folder' | 'doc';
  maxLength?: number;
}): string => {
  if (name.length <= MAX_LENGTH_DOCUMENT_NAME) {
    return name;
  }
  if (kind === 'folder') {
    return name.slice(0, maxLength);
  }
  const lastDotIndex = name.lastIndexOf('.');
  const extension = name.substring(lastDotIndex);
  const nameWithoutExtension = name.slice(0, maxLength);
  return `${nameWithoutExtension}${extension}`;
};

const getUniqueName = ({
  name,
  usedNames,
  kind,
}: {
  name: string;
  usedNames: Set<string>;
  kind: 'folder' | 'doc';
}): string => {
  let finalName = name;
  let counter = 1;

  finalName = truncateName({ name: finalName, kind });

  while (usedNames.has(finalName)) {
    finalName = kind === 'folder' ? addCounterToFolderName(name, counter) : addCounterToFilename(name, counter);
    counter++;
  }

  usedNames.add(finalName);
  return finalName;
};

export { addCounterToFolderName, addCounterToFilename, getUniqueName };
