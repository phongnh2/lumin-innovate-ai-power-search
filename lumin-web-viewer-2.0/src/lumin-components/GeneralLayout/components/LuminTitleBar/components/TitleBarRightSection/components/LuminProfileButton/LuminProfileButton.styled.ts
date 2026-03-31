import styled from "styled-components";

import MaterialAvatar from 'lumin-components/MaterialAvatar';

export const ProfileButton = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const AvatarButton = styled(MaterialAvatar)`
  cursor: pointer;
  ${(props) => (props.$disable && `
    opacity: 0.5;
    cursor: not-allowed !important;
  `)};
`;
