import { IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useTranslation } from 'hooks/useTranslation';

import { MessageName } from 'utils/Factory/EventCollection/RightBarEventCollection';

import { useToggleRightSideBarTool } from '../hooks/useToggleRightSideBarTool';

const SearchOverlayButton = () => {
  const { t } = useTranslation();
  const isDefaultMode = useSelector(selectors.isDefaultMode);
  const { isOpenSearchOverlay, toggleSearchOverlay } = useToggleRightSideBarTool();

  return (
    <PlainTooltip content={t('common.search')} position="left">
      <IconButton
        data-lumin-btn-name={MessageName.SEARCH_IN_DOCUMENT}
        icon="ph-magnifying-glass"
        size="lg"
        activated={isOpenSearchOverlay}
        onClick={toggleSearchOverlay}
        disabled={!isDefaultMode}
      />
    </PlainTooltip>
  );
};

export default SearchOverlayButton;
