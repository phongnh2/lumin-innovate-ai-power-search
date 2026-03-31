import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';
import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks/useTranslation';

import { PageToolViewMode } from 'constants/documentConstants';

interface SingleViewToolProps {
  renderAsMenuItem?: boolean;
}

const SingleViewTool = ({ renderAsMenuItem = false }: SingleViewToolProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const pageEditDisplayMode = useSelector(selectors.pageEditDisplayMode);
  const isActived = pageEditDisplayMode === PageToolViewMode.LIST;

  const onClick = () => {
    if (pageEditDisplayMode !== PageToolViewMode.LIST) {
      dispatch(actions.changePageEditDisplayMode(PageToolViewMode.LIST));
      core.updateView();
    }
  };

  if (renderAsMenuItem) {
    return (
      <MenuItem activated={isActived} leftSection={<Icomoon className="md_list" size={24} />} onClick={onClick}>
        {t('viewer.singleView')}
      </MenuItem>
    );
  }

  return (
    <SingleButton
      icon="md_list"
      iconSize={24}
      tooltipData={{ location: 'bottom', title: t('viewer.singleView') }}
      hideLabelOnSmallScreen
      isActive={isActived}
      onClick={onClick}
    />
  );
};

export default SingleViewTool;
