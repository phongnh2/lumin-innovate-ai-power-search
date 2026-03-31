import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { file } from 'utils';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import TemplateItemPopper from 'lumin-components/TemplateItemPopper';
import { withDeleteTemplate } from 'lumin-components/TemplateList/HOC/withDeleteTemplate';
import { useTabletMatch, useTemplatePermission, useTranslation } from 'hooks';
import * as Styled from './TemplateItem.styled';
import TemplateThumbnail from './TemplateThumbnail';

function TemplateItem({
  template,
  onPreview,
  onEdit,
  disabled,
  openDeleteTemplateModal,
  onInfo,
}) {
  const { t } = useTranslation();
  const isTabletUp = useTabletMatch();
  const [isOpenedMoreButton, setOpenedMoreButton] = useState(false);
  const permissions = useTemplatePermission(template);

  const getIconSize = () => (isTabletUp ? 20 : 12);

  const onContainerClick = () => {
    if (disabled) {
      return;
    }
    onPreview(template);
  };
  const onButtonClick = (e) => {
    e.stopPropagation();
    onPreview(template);
  };

  const popperActions = {
    info: () => onInfo(template),
    edit: () => onEdit(template),
    publish: () => {},
    delete: () => openDeleteTemplateModal(template),
  };

  return (
    <Styled.Container
      $disabled={disabled}
      $openedMoreButton={isOpenedMoreButton}
      onClick={onContainerClick}
    >
      <Styled.ThumbnailFrame>
        <Styled.ThumbnailContainer>
          <TemplateThumbnail thumbnail={template.thumbnail} name={template.name} />
        </Styled.ThumbnailContainer>

        <Styled.Overlay>
          <Styled.ButtonPreview
            size={isTabletUp ? ButtonSize.MD : ButtonSize.XS}
            fullWidth
            onClick={onButtonClick}
          >
            {t('templatePage.previewTemplate')}
          </Styled.ButtonPreview>
          <Styled.ButtonMoreContainer>
            <Styled.ButtonMore
              // eslint-disable-next-line react/no-unstable-nested-components
              contentPopper={({ closePopper }) => <TemplateItemPopper
                actions={popperActions}
                closePopper={closePopper}
                permissions={permissions}
              />}
              iconProps={{
                size: getIconSize(),
              }}
              onOpen={() => setOpenedMoreButton(true)}
              onClose={() => setOpenedMoreButton(false)}
            />
          </Styled.ButtonMoreContainer>
        </Styled.Overlay>
      </Styled.ThumbnailFrame>
      <Styled.Name>{file.getFilenameWithoutExtension(template.name)}</Styled.Name>
    </Styled.Container>
  );
}

TemplateItem.propTypes = {
  template: PropTypes.object.isRequired,
  onPreview: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  disabled: PropTypes.bool.isRequired,
  openDeleteTemplateModal: PropTypes.func.isRequired,
  onInfo: PropTypes.func,
};
TemplateItem.defaultProps = {
  onEdit: () => {},
  onInfo: () => {},
};
export default withDeleteTemplate(TemplateItem);
