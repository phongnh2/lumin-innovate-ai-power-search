import { useDispatch } from 'react-redux';

import actions from 'actions';

import { LEFT_PANEL_VALUES } from 'lumin-components/GeneralLayout/components/LuminLeftPanel/constants';

const useLeftPanel = () => {
  const dispatch = useDispatch();

  const setIsLeftPanelOpen = (value) => {
    dispatch(actions.setIsLeftPanelOpen(value));
  };

  const setLeftPanelValue = (value) => {
    dispatch(actions.setLeftPanelValue(value));
  };

  const closeLeftPanel = () => {
    setIsLeftPanelOpen(false);
    setLeftPanelValue(LEFT_PANEL_VALUES.THUMBNAIL);
  };

  const openLeftPanel = (name) => {
    setIsLeftPanelOpen(true);
    setLeftPanelValue(name);
  };

  return {
    closeLeftPanel,
    openLeftPanel,
  };
};

export default useLeftPanel;
