import { useRouter } from 'next/router';
import { useState } from 'react';

import { SOCKET_ON } from '@/constants/socket';
import useSocketListener from '@/hooks/useSocketListener';
import { ConfirmationDialog, Text } from '@/ui';

const ForceReloadModal = () => {
  const router = useRouter();
  const isGatewayPath = router.pathname.includes('/authentication/gateway');
  const [open, setOpen] = useState(false);
  useSocketListener(SOCKET_ON.User.forceReload, () => {
    setOpen(true);
  });
  return isGatewayPath ? (
    <></>
  ) : (
    <ConfirmationDialog
      open={open}
      title='Session changed warning'
      onConfirm={() => {
        window.location.reload();
      }}
      message={<Text align='center'>Your session has been changed. Reload the page to continue your work.</Text>}
      confirmText='Reload'
    />
  );
};

export default ForceReloadModal;
