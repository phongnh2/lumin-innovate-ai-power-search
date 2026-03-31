import PropTypes from 'prop-types';
import React from 'react';

import IconButton from '@new-ui/general-components/IconButton';

import { useTranslation } from 'hooks';

import { TEXT_DECORATORS } from './constants';
import { useUpdateDefaultRichStyles } from './hooks/useUpdateDefaultRichStyles';
import { TextDecorationBtnUtils } from './utils';

const TextDecorationBtn = ({ annotation, onChange }) => {
  const { t } = useTranslation();
  const { currentStyles, onUpdate: onDefaultRichStyleUpdate } = useUpdateDefaultRichStyles();

  const renderActiveClass = (actionKey, styleKey) => {
    if (!annotation) {
      return currentStyles?.[styleKey] === actionKey || currentStyles?.[styleKey]?.includes(actionKey);
    }

    const defaultStyle = annotation && annotation.getRichTextStyle();
    if (defaultStyle) {
      const richStyle = defaultStyle[Object.keys(defaultStyle)[0]];
      const objRichStyleKeys = Object.values(richStyle);

      return TextDecorationBtnUtils.checkExistedFontStyle(objRichStyleKeys, actionKey).styleStatus;
    }
    return '';
  };

  return (
    <>
      {TEXT_DECORATORS.map(({ icon, title, actionKey, styleKey }) => (
        <IconButton
          key={actionKey}
          iconSize={24}
          icon={icon}
          tooltipData={{ location: 'bottom', title: t(title) }}
          active={!!renderActiveClass(actionKey, styleKey)}
          onClick={() => {
            if (!annotation) {
              onDefaultRichStyleUpdate(actionKey);
              return;
            }
            TextDecorationBtnUtils.toggleFontStyle({ key: actionKey, annotation, onChange });
          }}
        />
      ))}
    </>
  );
};

TextDecorationBtn.propTypes = {
  annotation: PropTypes.object,
  onChange: PropTypes.func,
};

TextDecorationBtn.defaultProps = {
  annotation: {},
  onChange: (f) => f,
};

export default TextDecorationBtn;
