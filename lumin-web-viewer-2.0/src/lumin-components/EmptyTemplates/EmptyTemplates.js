import React from 'react';
import EmptyImg from 'assets/images/empty-document-list.svg';
import { useDesktopMatch, useTabletMatch } from 'hooks';
import * as Styled from './EmptyTemplates.styled';

function EmptyTemplates() {
  const isTabletUp = useTabletMatch();
  const isDesktopUp = useDesktopMatch();
  const getContent = () => {
    if (isDesktopUp) {
      return {
        title: 'Drop files here',
        text: 'or use the “New template" button',
      };
    }
    if (isTabletUp) {
      return {
        title: 'Use the “New Template” button',
        text: 'to upload template',
      };
    }
    return {
      title: 'Use the “Add” button',
      text: 'to upload template',
    };
  };

  const { title, text } = getContent();

  return (
    <Styled.Container>
      <Styled.Circle>
        <Styled.Img src={EmptyImg} alt="empty templates" />
        <Styled.Title>{title}</Styled.Title>
        <Styled.Text>{text}</Styled.Text>
      </Styled.Circle>
    </Styled.Container>
  );
}

export default EmptyTemplates;
