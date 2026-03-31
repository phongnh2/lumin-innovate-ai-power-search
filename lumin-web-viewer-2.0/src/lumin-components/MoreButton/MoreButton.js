import classNames from 'classnames';
import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import ButtonMaterial from 'lumin-components/ViewerCommon/ButtonMaterial';

import './MoreButton.scss';

const MoreButton = () => {
  const [isShowToolbarTablet] = useSelector((state) => [selectors.getIsShowToolbarTablet(state)], shallowEqual);

  const dispatch = useDispatch();

  const toggleToolbarTablet = () => {
    dispatch(actions.setIsShowToolbarTablet(!isShowToolbarTablet));
  };
  return (
    <div
      className={classNames('MoreButton hide-in-small-desktop-up', {
        'MoreButton--active': isShowToolbarTablet,
      })}
    >
      <ButtonMaterial id="deactiveEditModePage" className="square" onClick={toggleToolbarTablet}>
        <Icomoon className="more icon__20" />
      </ButtonMaterial>
    </div>

  );
};

export default MoreButton;
