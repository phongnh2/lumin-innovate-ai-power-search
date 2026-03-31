import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useTranslation } from 'hooks';

import { folderType } from 'constants/documentConstants';
import { Colors } from 'constants/styles';

const getDocumentListTooltip = (t) => ({
  [folderType.INDIVIDUAL]: t('documentPage.tooltipMyDocument'),
  [folderType.TEAMS]: t('documentPage.tooltipTeamDocument'),
  [folderType.ORGANIZATION]: t('documentPage.tooltipOrgDocument'),
  [folderType.STARRED]: t('documentPage.tooltipStarredDocument'),
  [folderType.SHARED]: t('documentPage.tooltipSharedDocument'),
  [folderType.DEVICE]: t('documentPage.tooltipDeviceDocument'),
});

const DocumentListInfo = ({ currentFolderType }) => {
  const { t } = useTranslation();
  const documentListTooltip = getDocumentListTooltip(t);

  const tooltipStyle = {
    fontSize: 12,
    maxWidth: 400,
  };
  return (
    <Tooltip
      title={documentListTooltip[currentFolderType]}
      tooltipStyle={tooltipStyle}
      placement="bottom-start"
    >
      <Icomoon className="info" size={18} color={Colors.NEUTRAL_60} />
    </Tooltip>
  );
};

DocumentListInfo.propTypes = {
  currentFolderType: PropTypes.string.isRequired,
};

export default DocumentListInfo;
