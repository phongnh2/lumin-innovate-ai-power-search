import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Colors } from 'constants/styles';

export const TransferDocumentContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto;
`;

export const Backdrop = styled.div<{$open?: boolean}>`
  position: absolute;
  left: 0%;
  right: 0%;
  top: 0%;
  bottom: 0%;
  background: ${Colors.DOCUMENT_OVERLAY};
  visibility: ${({ $open }) => $open ? 'visible' : 'hidden'};
  opacity: ${({ $open }) => $open ? 1 : 0};
  transition: all 0.3s ease;
`;

export const BackdropReskin = styled.div<{$open?: boolean}>`
  position: absolute;
  left: 0%;
  right: 0%;
  top: 0%;
  bottom: 0%;
  background: var(--kiwi-colors-add-on-scrim);
  visibility: ${({ $open }) => $open ? 'visible' : 'hidden'};
  opacity: ${({ $open }) => $open ? 'var(--kiwi-opacity-scrim-default)' : 0};
  transition: var(--default-web-transition);
`;


export const CustomLink = styled(Link)`
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  text-decoration: underline;
  &[data-reskin='true'] {
    color: inherit;
  };
`;
