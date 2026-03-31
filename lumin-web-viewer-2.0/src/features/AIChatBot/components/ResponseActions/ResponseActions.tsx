import { Chip } from 'lumin-ui/kiwi-ui';
import React from 'react';

type ReponseActionsProps = {
  onClick: () => void;
  label: string;
  icon: React.JSX.Element;
};

const ResponseActions = ({ responseActions }: { responseActions: ReponseActionsProps }) => {
  const { onClick, label, icon } = responseActions;

  return <Chip leftIcon={icon} label={label} onClick={onClick} rounded w="fit-content" enablePointerEvents />;
};

export default ResponseActions;
