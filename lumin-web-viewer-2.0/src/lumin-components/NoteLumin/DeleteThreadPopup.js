import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'hooks';
import ButtonMaterial, { ButtonColor } from 'lumin-components/ButtonMaterial';

const DeleteThreadPopup = ({ setIsShowDeleteOverlay, handleDelete, isCommentAnnotation }) => {
  const { t } = useTranslation();
  return (
    <div className="note_delete_content">
      <div className="note_delete_content_title">
        {isCommentAnnotation ? t('viewer.noteContent.deleteCommentThread') : t('viewer.noteContent.deleteNote')}
      </div>
      <div className="note_delete_content_button_group">
        <ButtonMaterial
          color={ButtonColor.TERTIARY}
          onClick={() => setIsShowDeleteOverlay(false)}
        >
          {t('common.cancel')}
        </ButtonMaterial>
        <ButtonMaterial onClick={handleDelete}>
          {t('common.delete')}
        </ButtonMaterial>
      </div>
    </div>
  );
};
DeleteThreadPopup.propTypes = {
  setIsShowDeleteOverlay: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  isCommentAnnotation: PropTypes.bool.isRequired,
};

export default DeleteThreadPopup;