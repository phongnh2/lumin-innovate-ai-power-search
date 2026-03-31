import { TextSize, TextType } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';
import Highlighter from 'react-highlight-words';

import { TextField } from '@web-new-ui/components/DocumentListItem/components';

import { DocumentSearchContext } from 'luminComponents/Document/context';

type FolderNameProps = {
  name: string;
};

const FolderName = ({ name }: FolderNameProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { searchKey } = useContext(DocumentSearchContext);

  return (
    <TextField
      value={name}
      type={TextType.title}
      size={TextSize.sm}
      tooltip
      color="var(--kiwi-colors-surface-on-surface)"
    >
      <Highlighter highlightClassName="text-highlight" searchWords={[searchKey]} autoEscape textToHighlight={name} />
    </TextField>
  );
};

export default FolderName;
