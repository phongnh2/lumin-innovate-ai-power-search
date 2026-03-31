import { Button, InlineMessage, Paper, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import CreateOrganization from 'assets/images/create-organization.png';

import actions from 'actions';
import selectors from 'selectors';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import CustomHeader from 'lumin-components/CustomHeader';
import { LayoutSecondary } from 'lumin-components/Layout';
import TrackedForm from 'lumin-components/Shared/TrackedForm';

import withEnableWebReskin from 'HOC/withEnableWebReskin';
import withRouter from 'HOC/withRouter';

import organizationServices from 'services/organizationServices';

import { toastUtils, errorUtils } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { COMMON_FORM_INFO } from 'utils/Factory/EventCollection/FormEventCollection';
import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import { TOAST_DURATION_ERROR_INVITE_MEMBER } from 'constants/customConstant';
import { ErrorCode } from 'constants/errorCode';
import { ModalTypes, STATUS_CODE } from 'constants/lumin-common';
import { ERROR_MESSAGE_RESTRICTED_ACTION, WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER } from 'constants/messages';
import {
  ORGANIZATION_ROLES,
  ORG_ACTION,
  ORGANIZATION_TEXT,
  MAX_CREATED_ORG_NUMBER,
} from 'constants/organizationConstants';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import AddMember from './components/AddMember';
import InputName from './components/InputName';
import UploadLogo from './components/UploadLogo';
import { OrganizationCreateContext } from './OrganizationCreate.context';
import withOrganizationCreate from './OrganizationCreateHOC';

import {
  StyledContent,
  StyledContentLeft,
  StyledContentRight,
  StyledImage,
  StyledForm,
  StyledFormTitle,
  StyledFormContent,
  StyledFormFooter,
  StyledButton,
  StyledError,
  StyledAlert,
  StyledFormDescription,
} from './OrganizationCreate.styled';

import styles from './OrganizationCreate.module.scss';

const FormContent = () => (
  <>
    <UploadLogo />
    <InputName />
    <AddMember />
  </>
);

class OrganizationCreate extends React.PureComponent {
  constructor(props) {
    super(props);
    const { _id: userId, name: userName, email: userEmail, avatarRemoteId } = props.currentUser;
    this.state = {
      file: '',
      error: '',
      isCreating: false,
      organizationName: '',
      organizationNameError: '',
      members: [
        {
          _id: userId,
          name: userName,
          email: userEmail,
          avatarRemoteId,
          role: ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
          addedInOrg: true,
        },
      ],
      pendingMembers: [],
      // eslint-disable-next-line react/no-unused-state
      updatedWorkspaceName: false,
    };
  }

  beforeCreate = () => !this.state.isCreating && this.handleSubmit();

  handleSubmit = async () => {
    const { members, file, organizationName, pendingMembers } = this.state;
    const { addNewOrganization, openModal, currentUser, updateCurrentUser, t } = this.props;
    const organizationNameTrimmed = organizationName.trim();
    const {
      metadata: { numberCreatedOrg },
    } = currentUser;
    const modalSetting = {
      type: ModalTypes.WARNING,
      title: t('createOrg.actionCannotBePerformed'),
      message: t('createOrg.createdOrgsHitTheLimit'),
      confirmButtonTitle: t('common.ok'),
      useReskinModal: true,
      confirmButtonProps: {
        withExpandedSpace: true,
      },
    };
    if (numberCreatedOrg >= MAX_CREATED_ORG_NUMBER) {
      openModal(modalSetting);
      return;
    }
    this.setState({ isCreating: true });
    try {
      const membersData = members
        .map(
          (member) =>
            !organizationServices.isOrgAdmin(member.role) && {
              email: member.email,
              role: member.role,
            }
        )
        .filter(Boolean);
      const { organization: createdOrganization, statusCode } = await organizationServices.createOrganization({
        file,
        organizationData: {
          name: organizationNameTrimmed,
          members: [...membersData, ...pendingMembers],
        },
      });
      if (statusCode === STATUS_CODE.BAD_REQUEST) {
        toastUtils.openToastMulti({
          type: ModalTypes.WARNING,
          message: t(WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER),
          duration: TOAST_DURATION_ERROR_INVITE_MEMBER,
        });
      }

      if (createdOrganization) {
        addNewOrganization(createdOrganization);
        updateCurrentUser({
          metadata: { numberCreatedOrg: numberCreatedOrg + 1 },
        });
        this.handleRedirect(createdOrganization);
      }
    } catch (error) {
      this.createOrgFailed({ error, modalSetting });
    } finally {
      this.setState({ isCreating: false });
    }
  };

  handleRedirect = ({ url, _id }) => {
    const { location, navigate } = this.props;
    const { paymentUrl } = location.state || {};
    const linkTo = paymentUrl
      ? `${paymentUrl}?${UrlSearchParam.PAYMENT_ORG_TARGET}=${_id}`
      : getDefaultOrgUrl({ orgUrl: url });
    navigate(linkTo, {
      state: {
        action: !paymentUrl ? ORG_ACTION.WELCOME : '',
      },
    });
  };

  createOrgFailed({ error, modalSetting }) {
    const { openModal } = this.props;
    const { code } = errorUtils.extractGqlError(error);
    switch (code.toLowerCase()) {
      case ErrorCode.Common.RESTRICTED_ACTION: {
        toastUtils.error({ message: ERROR_MESSAGE_RESTRICTED_ACTION });
        break;
      }
      case ErrorCode.Org.REACH_LIMIT_CREATED_ORG: {
        openModal(modalSetting);
        break;
      }
      case ErrorCode.User.USER_DELETING: {
        break;
      }
      default: {
        toastUtils.openUnknownErrorToast();
        break;
      }
    }
  }

  renderContent = () => {
    const { isCreating, error, organizationNameError, organizationName } = this.state;
    const { isTabletMatch, t, isEnableReskin } = this.props;
    const isDisableCreate = Boolean(error || organizationNameError || !organizationName?.trim() || isCreating);
    const { formName, formPurpose } = COMMON_FORM_INFO.createOrganization;
    if (isEnableReskin) {
      return (
        <div className={styles.contentContainer}>
          <Paper
            w="var(--kiwi-sizing-dialogs-sm)"
            p="var(--kiwi-spacing-3)"
            radius="lg"
            elevation="lg"
            className={styles.wrapper}
          >
            <div className={styles.titleSection}>
              <Text type="headline" size="lg">
                {t('createOrg.createYourOrg')}
              </Text>
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                {t('createOrg.description')}
              </Text>
            </div>
            {error && (
              <div>
                <InlineMessage type="error" message={error} />
              </div>
            )}
            <FormContent />
            <div className={styles.footerWrapper}>
              <Button
                disabled={isDisableCreate}
                onClick={this.beforeCreate}
                loading={isCreating}
                data-lumin-btn-name={ButtonName.ORGANIZATION_CREATE}
                data-lumin-btn-purpose={ButtonPurpose[ButtonName.ORGANIZATION_CREATE]}
                size="lg"
                style={{
                  '--button-padding': 'var(--kiwi-spacing-1) var(--kiwi-spacing-4)',
                }}
              >
                {t('common.create')}
              </Button>
            </div>
          </Paper>
        </div>
      );
    }
    return (
      <StyledContent>
        <StyledContentLeft>
          <StyledImage src={CreateOrganization} alt={`create ${ORGANIZATION_TEXT}`} />
        </StyledContentLeft>
        <StyledContentRight>
          <TrackedForm
            formName={formName}
            formPurpose={formPurpose}
            onSubmit={this.beforeCreate}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <StyledForm>
              <StyledFormTitle>{t('createOrg.title')}</StyledFormTitle>
              <StyledFormDescription>{t('createOrg.description')}</StyledFormDescription>
              <StyledFormContent>
                {error && (
                  <StyledAlert>
                    <StyledError>{error}</StyledError>
                  </StyledAlert>
                )}
                <FormContent />
              </StyledFormContent>
              <StyledFormFooter>
                <StyledButton
                  type="button"
                  className="primary"
                  disabled={isDisableCreate}
                  onClick={this.beforeCreate}
                  loading={isCreating}
                  fullWidth
                  size={isTabletMatch ? ButtonSize.XL : ButtonSize.MD}
                  data-lumin-btn-name={ButtonName.ORGANIZATION_CREATE}
                  data-lumin-btn-purpose={ButtonPurpose[ButtonName.ORGANIZATION_CREATE]}
                >
                  {t('common.create')}
                </StyledButton>
              </StyledFormFooter>
            </StyledForm>
          </TrackedForm>
        </StyledContentRight>
      </StyledContent>
    );
  };

  render() {
    const { t, isEnableReskin } = this.props;
    return (
      <OrganizationCreateContext.Provider
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        value={{ state: this.state, setState: (newState) => this.setState(newState) }}
      >
        <CustomHeader metaTitle={t('metaTitle.createOrg')} description={t('metaDescription.createOrg')} />
        <LayoutSecondary
          footer={false}
          isReskin={isEnableReskin}
          backgroundColor={isEnableReskin && 'var(--kiwi-colors-surface-surface-container-low)'}
        >
          {this.renderContent()}
        </LayoutSecondary>
      </OrganizationCreateContext.Provider>
    );
  }
}

OrganizationCreate.propTypes = {
  navigate: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  addNewOrganization: PropTypes.func,
  currentUser: PropTypes.object.isRequired,
  isTabletMatch: PropTypes.bool,
  openModal: PropTypes.func.isRequired,
  updateCurrentUser: PropTypes.func.isRequired,
  t: PropTypes.func,
  isEnableReskin: PropTypes.bool,
};

OrganizationCreate.defaultProps = {
  addNewOrganization: () => {},
  isTabletMatch: true,
  t: () => {},
  isEnableReskin: false,
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  addNewOrganization: (newData) => dispatch(actions.addNewOrganization(newData)),
  openModal: (modalSetting) => dispatch(actions.openModal(modalSetting)),
  updateCurrentUser: (data) => dispatch(actions.updateCurrentUser(data)),
});

export default withRouter(
  compose(
    React.memo,
    connect(mapStateToProps, mapDispatchToProps),
    withTranslation(),
    withEnableWebReskin
  )(withOrganizationCreate(OrganizationCreate))
);
