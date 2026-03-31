import { useDisclosure } from '@mantine/hooks';
import { Menu } from 'lumin-ui/kiwi-ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ModalContent from '@new-ui/components/PopupLinkBtn/ModalContent';
import Divider from '@new-ui/general-components/Divider';
import IconButton from '@new-ui/general-components/IconButton';

import Modal from 'lumin-components/GeneralLayout/general-components/Modal';

import ChangeDateFormat from './ChangeDateFormat';
import NewAddNote from './NewAddNote';
import NewBrings from './NewBrings';
import NewEditStyle from './NewEditStyle';
import NewLinks from './NewLinks';
import useAnnotationPopupBtnCondition from '../../hooks/useAnnotationPopupBtnCondition';

interface IMoreOptions {
  anchorRef: HTMLElement;
  open: boolean;
  onClick: () => void;
  onClose: () => void;
}

const MoreOptions = (props: IMoreOptions) => {
  const { onClick, onClose } = props;
  const { t } = useTranslation();
  const [openModalAddLink, setOpenModalAddLink] = useState(false);
  const popperRef = useRef<HTMLDivElement>(null);
  const [opened, handlers] = useDisclosure();

  const { showEditStyleButton, showCommentButton, showReorderButton, showCalendarButton } = useAnnotationPopupBtnCondition();

  const handleCloseModalAddLink = () => {
    setOpenModalAddLink(false);
  };

  return (
    <>
      <Menu
        closeOnItemClick
        ComponentTarget={
          <IconButton
            tooltipData={{ location: 'bottom', title: t('common.more') }}
            icon="three-dots"
            iconSize={24}
            onClick={onClick}
          />
        }
        offset={16}
        position="right-start"
        styles={{ dropdown: { minWidth: 304 } }}
      >
        {showEditStyleButton ? <NewEditStyle /> : null}
        {showCalendarButton ? (
          <ChangeDateFormat
            popperRef={popperRef.current}
            open={opened}
            onClick={handlers.toggle}
            onClose={handlers.close}
          />
        ) : null}
        {(showEditStyleButton || showCalendarButton) && <Divider />}
        {showCommentButton ? <NewAddNote onClosePopper={onClose} /> : null}
        <NewLinks
          onOpenAddLink={() => {
            onClose();
            setOpenModalAddLink(true);
          }}
        />
        {showReorderButton ? <NewBrings /> : null}
      </Menu>
      <Modal
        primaryText=""
        open={openModalAddLink}
        onClose={handleCloseModalAddLink}
        footer={null}
        footerVariant={null}
      >
        <ModalContent closeModal={handleCloseModalAddLink} />
      </Modal>
    </>
  );
};

export default MoreOptions;
