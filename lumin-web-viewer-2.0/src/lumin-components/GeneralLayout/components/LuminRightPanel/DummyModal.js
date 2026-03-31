import React from 'react';

import Modal from 'lumin-components/GeneralLayout/general-components/Modal';

const DummyModal = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <button onClick={handleOpen}>Open modal</button>

      <Modal size="extra-large" open={open} onClose={handleClose} title="zxc">
        <div>asd</div>
      </Modal>
    </>
  );
};

export default DummyModal;
