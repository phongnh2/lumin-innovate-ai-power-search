import get from 'lodash/get';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';

import { useTranslation } from 'hooks';

import { userServices } from 'services';

import { USER_METADATA_KEY } from 'constants/userConstants';

import * as Styled from '../../EditPdfPanel.styled';

export default function EditPdfPopover() {
  const { t } = useTranslation();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const [isOpen, setIsOpen] = useState(true);

  const hasShownContentEditPopover = get(currentUser, 'metadata.hasShownContentEditPopover', false);
  const handleClick = () => {
    setIsOpen(false);
    userServices.updateUserMetadata({ key: USER_METADATA_KEY.HAS_SHOWN_CONTENT_EDIT_POPOVER, value: true });
  };

  if (!isOpen || hasShownContentEditPopover) {
    return null;
  }

  return (
    <Styled.PopoverWrapper>
      <Styled.PopoverTitle>{t('viewer.contentEditPopover.title')}</Styled.PopoverTitle>
      <Styled.CloseButton icon="sm_close" onClick={handleClick} iconSize={24} />
      <Styled.StyledList>
        <Trans
          i18nKey="viewer.contentEditPopover.message"
          components={{
            li: <li />,
            b: <span />,
            Icomoon: <Icomoon className="edit-team" size={12} />,
          }}
        />
      </Styled.StyledList>
    </Styled.PopoverWrapper>
  );
}
