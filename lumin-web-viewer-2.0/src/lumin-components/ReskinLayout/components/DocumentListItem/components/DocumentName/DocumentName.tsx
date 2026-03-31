import { TextSize, TextType } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';
import Highlighter from 'react-highlight-words';

import { DocumentSearchContext } from 'luminComponents/Document/context';

import { TextField } from '../TextField';

type DocumentNameProps = {
  disabled: boolean;
  name: string;
};

const DocumentName = ({ name, disabled }: DocumentNameProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { searchKey } = useContext(DocumentSearchContext);

  return (
    <TextField
      value={name}
      disabled={disabled}
      type={TextType.title}
      size={TextSize.sm}
      tooltip
      color="var(--kiwi-colors-surface-on-surface)"
    >
      <Highlighter highlightClassName="text-highlight" searchWords={[searchKey]} autoEscape textToHighlight={name} />
    </TextField>
  );
};

export default DocumentName;
