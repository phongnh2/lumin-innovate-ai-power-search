import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';
import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks/useTranslation';

import { PageToolViewMode } from 'constants/documentConstants';

interface GridViewToolProps {
  renderAsMenuItem?: boolean;
}

const GridViewTool = ({ renderAsMenuItem = false }: GridViewToolProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const pageEditDisplayMode = useSelector(selectors.pageEditDisplayMode);
  const isActived = pageEditDisplayMode === PageToolViewMode.GRID;

  const onClick = () => {
    if (pageEditDisplayMode !== PageToolViewMode.GRID) {
      dispatch(actions.changePageEditDisplayMode(PageToolViewMode.GRID));
      dispatch(actions.updateThumbs([]));
    }
  };

  if (renderAsMenuItem) {
    return (
      <MenuItem activated={isActived} leftSection={<Icomoon className="md_grid" size={24} />} onClick={onClick}>
        {t('viewer.gridView')}
      </MenuItem>
    );
  }

  return (
    <SingleButton
      icon="md_grid"
      iconSize={24}
      tooltipData={{ location: 'bottom', title: t('viewer.gridView') }}
      hideLabelOnSmallScreen
      isActive={isActived}
      onClick={onClick}
    />
  );
};

export default GridViewTool;
