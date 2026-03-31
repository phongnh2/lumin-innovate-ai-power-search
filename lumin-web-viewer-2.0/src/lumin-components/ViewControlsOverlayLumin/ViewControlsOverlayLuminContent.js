import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import Button from 'lumin-components/ViewerCommon/ButtonLumin';

import { useTranslation } from 'hooks';

import displayModeObjects from 'constants/displayModeObjects';

const ViewControlsOverlayLuminContent = ({ displayMode }) => {
  const { t } = useTranslation();
  const handleClick = (pageTransition, layout) => {
    const displayModeObject = displayModeObjects.find(
      (obj) => obj.pageTransition === pageTransition && obj.layout === layout
    );

    core.setDisplayMode(displayModeObject.displayMode);
  };

  const { pageTransition, layout } = displayModeObjects.find((obj) => obj.displayMode === displayMode);

  return (
    <div>
      <div className="ViewControlsOverlayLumin__container ViewControlsOverlayLumin__container--has-margin">
        <div className="ViewControlsOverlayLumin__title--wrapper">
          <div className="title">{t('option.displayMode.pageTransition')}</div>
        </div>
        <div className="ViewControlsOverlayLumin__button--wrapper">
          <Button
            className="ViewControlsOverlayLumin__button"
            dataElement="defaultPageTransitionButton"
            title="option.pageTransition.default"
            icon="single-page-view"
            onClick={() => handleClick('default', layout)}
            isActive={pageTransition === 'default'}
          />
          <Button
            className="ViewControlsOverlayLumin__button"
            dataElement="continuousPageTransitionButton"
            title="option.pageTransition.continuous"
            icon="mode-continuous"
            onClick={() => handleClick('continuous', layout)}
            isActive={pageTransition === 'continuous'}
          />
        </div>
      </div>

      <div className="ViewControlsOverlayLumin__container">
        <div className="ViewControlsOverlayLumin__title--wrapper">
          <div className="title">{t('option.displayMode.layout')}</div>
        </div>
        <div className="ViewControlsOverlayLumin__button--wrapper">
          <Button
            className="ViewControlsOverlayLumin__button"
            dataElement="singleLayoutButton"
            title="option.layout.single"
            icon="one-page-view"
            onClick={() => handleClick(pageTransition, 'single')}
            isActive={layout === 'single'}
          />
          <Button
            className="ViewControlsOverlayLumin__button"
            dataElement="doubleLayoutButton"
            title="option.layout.double"
            icon="two-page-view"
            iconSize={20}
            onClick={() => handleClick(pageTransition, 'double')}
            isActive={layout === 'double'}
          />
          <Button
            className="ViewControlsOverlayLumin__button ViewControlsOverlayLumin__button--no-margin"
            dataElement="coverLayoutButton"
            title="option.layout.cover"
            icon="cover-view"
            iconSize={20}
            onClick={() => handleClick(pageTransition, 'cover')}
            isActive={layout === 'cover'}
          />
        </div>
      </div>
    </div>
  );
};
ViewControlsOverlayLuminContent.propTypes = {
  displayMode: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  displayMode: selectors.getDisplayMode(state),
});

const mapDispatchToProps = () => {};

export default connect(mapStateToProps, mapDispatchToProps)(ViewControlsOverlayLuminContent);
