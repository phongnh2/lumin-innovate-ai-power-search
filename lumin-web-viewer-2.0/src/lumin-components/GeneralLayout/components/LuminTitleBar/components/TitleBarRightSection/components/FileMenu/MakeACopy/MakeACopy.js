import { MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useNetworkStatus } from 'hooks/useNetworkStatus';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import UserEventConstants from 'constants/eventConstants';

const MakeACopy = ({ handleClick, disabled = false, tooltipContent = '' }) => {
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { isTemplateViewer } = useTemplateViewerMatch();

  const { isOffline } = useNetworkStatus();
  if (currentUser && !currentDocument.isSystemFile && !isTemplateViewer) {
    return (
      <PlainTooltip content={tooltipContent} position="left">
        <MenuItem
          size="dense"
          leftSection={<Icomoon className="md_copy" size={24} />}
          onClick={handleClick}
          disabled={disabled || isOffline}
          data-lumin-btn-name={UserEventConstants.Events.HeaderButtonsEvent.MAKE_COPY}
        >
          {t('common.makeACopy')}
        </MenuItem>
      </PlainTooltip>
    );
  }
  return null;
};

MakeACopy.propTypes = {
  handleClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  tooltipContent: PropTypes.string,
};

export default MakeACopy;
