import React, { ReactNode } from 'react';

import * as Styled from './RightPanelHeader.styled';

interface IRightPanelHeader {
  title: string;
  closeButton: boolean;
  buttonGroup?: ReactNode;
  onClose: () => void;
}

const RightPanelHeader = (props: IRightPanelHeader) => {
  const { title, closeButton, buttonGroup, onClose } = props;
  return (
    <Styled.Header>
      <Styled.Title>{title}</Styled.Title>
      <Styled.ButtonGroup>
        {buttonGroup}
        {closeButton && (
          <Styled.ClosePanelButton data-cy="close_panel_button" icon="md_close" iconSize={24} onClick={onClose} />
        )}
      </Styled.ButtonGroup>
    </Styled.Header>
  );
};

export default RightPanelHeader;
