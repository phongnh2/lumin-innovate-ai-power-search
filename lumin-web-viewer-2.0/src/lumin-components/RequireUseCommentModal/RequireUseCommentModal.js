/* eslint-disable jsx-a11y/no-static-element-interactions */
import classNames from 'classnames';
import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Link } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import Icomoon from 'luminComponents/Icomoon';

import './RequireUseCommentModal.scss';
import { useTranslation } from 'hooks';

import { Routers } from 'constants/Routers';

const getContentModalMap = ({ translator }) => ({
  SIGN_IN: {
    title: translator('viewer.makeACopy.signInRequired'),
    message: translator('viewer.commentToolModal.signInToUseComment'),
    primaryBtnName: translator('viewer.makeACopy.signInNow'),
  },
  PERMISSION_REQUIRED: {
    title: translator('viewer.requestPermissionUpModal.permissionRequired'),
    message: translator('viewer.commentToolModal.havePermissionToUseComment'),
    primaryBtnName: translator('common.gotIt'),
  },
});

function RequireUseCommentModal() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => selectors.isElementOpen(state, 'requireUseCommentModal'));

  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const contentModal = getContentModalMap({ translator: t });
  const getContentModal = currentUser ? contentModal.PERMISSION_REQUIRED : contentModal.SIGN_IN;

  const closeModal = () => {
    dispatch(actions.closeElement('requireUseCommentModal'));
  };

  const renderRequiredSignInContent = () => (
    <div className="button-wrapper">
      <ButtonMaterial
        type="button"
        color={ButtonColor.SECONDARY}
        size={ButtonSize.XL}
        onClick={closeModal}
      >
        Cancel
      </ButtonMaterial>
      <Link to={Routers.SIGNIN} replace>
        <ButtonMaterial
          type="button"
          color={ButtonColor.PRIMARY}
          size={ButtonSize.XL}
        >
          {getContentModal.primaryBtnName}
        </ButtonMaterial>
      </Link>
    </div>
  );

  const renderPermissionContent = () => (
    <div className="button-wrapper--one-column">
      <ButtonMaterial
        type="button"
        color={ButtonColor.PRIMARY}
        size={ButtonSize.XL}
        onClick={closeModal}
      >
        {getContentModal.primaryBtnName}
      </ButtonMaterial>
    </div>
  );

  return !isOpen ? null : (
    <div
      className={classNames({
        Modal: true,
        RequireUseCommentModal: true,
        open: isOpen,
        closed: !isOpen,
      })}
      data-element="requireUseCommentModal"
      onClick={closeModal}
    >
      <div className="container" onClick={(e) => e.stopPropagation()}>
        <Icomoon className="comment-alt container-icon" size={40} />
        <div className="title">{getContentModal.title}</div>
        <div className="message">{getContentModal.message}</div>
        {currentUser ? renderPermissionContent() : renderRequiredSignInContent()}
      </div>
    </div>
  );
}

export default RequireUseCommentModal;
