import React, { useState } from 'react';

import Modal from '@new-ui/general-components/Modal';

import ToolButtonPopper from 'lumin-components/ToolButtonPopper';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { FEATURE_VALIDATION } from 'constants/lumin-common';

interface SignInRequiredProviderProps {
  render: ({ validate }: { validate: () => boolean }) => React.ReactNode;
}

const SignInRequiredProvider = ({ render }: SignInRequiredProviderProps) => {
  const [isOpen, setOpen] = useState(false);
  const currentUser = useGetCurrentUser();
  const validate = () => {
    if (!currentUser) {
      setOpen(true);
      return false;
    }
    return true;
  };

  return (
    <>
      {render({
        validate,
      })}
      <Modal open={isOpen} onClose={() => setOpen(false)}>
        <ToolButtonPopper validateType={FEATURE_VALIDATION.SIGNIN_REQUIRED} renderContentOnly openPopper />
      </Modal>
    </>
  );
};

export default SignInRequiredProvider;
