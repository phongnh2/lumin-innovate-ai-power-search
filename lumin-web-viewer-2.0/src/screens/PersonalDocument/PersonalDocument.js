/* eslint-disable sonarjs/no-duplicate-string */
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

import Document from 'lumin-components/Document';
import CustomHeader from 'luminComponents/CustomHeader';

import withDragMoveDoc from 'HOC/withDragMoveDoc';
import withDropDocPopup from 'HOC/withDropDocPopup';
import withEnableWebReskin from 'HOC/withEnableWebReskin';
import withGetFolderType from 'HOC/withGetFolderType';
import withRedirectWorkspace from 'HOC/withRedirectWorkspace';

import * as Styled from './PersonalDocument.styled';

class PersonalDocument extends React.PureComponent {
  render() {
    const { t, isEnableReskin } = this.props;

    const ReskinComponents = isEnableReskin
      ? {
          Container: Styled.ContainerReskin,
        }
      : {
          Container: Styled.Container,
        };

    return (
      <>
        <CustomHeader metaTitle={t('metaTitle.personalDocument')} description={t('metaDescription.personalDocument')} />
        <ReskinComponents.Container>
          <Document />
        </ReskinComponents.Container>
      </>
    );
  }
}

PersonalDocument.propTypes = {
  t: PropTypes.func,
  isEnableReskin: PropTypes.bool,
};

PersonalDocument.defaultProps = {
  t: () => {},
  isEnableReskin: false,
};

export default compose(
  withRedirectWorkspace,
  withDropDocPopup.Provider,
  withDragMoveDoc.Provider,
  withGetFolderType,
  withTranslation(),
  withEnableWebReskin,
  React.memo
)(PersonalDocument);
