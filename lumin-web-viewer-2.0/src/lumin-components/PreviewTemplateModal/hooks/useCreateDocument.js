import { capitalize } from 'lodash';
import React, { useContext } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';

import selectors from 'selectors';

import TemplateContext from 'screens/Templates/context';

import { useGetCurrentTeam, useForceReloadModal } from 'hooks';

import templateServices from 'services/templateServices';

import { toastUtils } from 'utils';
import templateEvent from 'utils/Factory/EventCollection/TemplateEventCollection';

import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_TEXT } from 'constants/organizationConstants';
import { TEMPLATE_TABS } from 'constants/templateConstant';
import { WorkspaceTemplate } from 'constants/workspaceTemplate';

const useCreateDocument = ({ setDownloading, templateType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTemplates } = useContext(TemplateContext);
  const onConfirm = () => {
    getTemplates();
    navigate(location.pathname, { replace: true });
  };
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const currentTeam = useGetCurrentTeam() || {};
  const { openModal } = useForceReloadModal({ onConfirm });
  const handleError = () => {
    openModal();
    setDownloading(false);
  };

  const create = async ({ templateId: _templateId, notify }) => {
    try {
      setDownloading(true);
      const document = await templateServices.createDocument({
        templateId: _templateId,
        notify,
      });
      navigate(`/viewer/${document._id}`);
      let cloneTemplateLocation = '';
      switch (templateType) {
        case TEMPLATE_TABS.PERSONAL:
          cloneTemplateLocation = 'Personal';
          break;
        case TEMPLATE_TABS.ORGANIZATION: {
          const isCreateToOrgWorkSpace =
            templateType === TEMPLATE_TABS.ORGANIZATION &&
            currentOrganization.data.settings.templateWorkspace === WorkspaceTemplate.ORGANIZATION;
          cloneTemplateLocation = isCreateToOrgWorkSpace ? capitalize(ORGANIZATION_TEXT) : 'Personal';
          break;
        }
        case TEMPLATE_TABS.TEAM: {
          const isCreateToTeamWorkSpace =
            templateType === TEMPLATE_TABS.TEAM &&
            currentTeam.settings.templateWorkspace === WorkspaceTemplate.ORGANIZATION_TEAM;
          cloneTemplateLocation = isCreateToTeamWorkSpace ? 'Team' : 'Personal';
          break;
        }
        default:
          break;
      }
      templateEvent.useTemplateSuccess({
        fileId: _templateId,
        location: cloneTemplateLocation.toLowerCase(),
      });

      toastUtils.openToastMulti({
        message: (
          <>
            Template has been copied to <b>{cloneTemplateLocation} Documents</b>
          </>
        ),
        type: ModalTypes.SUCCESS,
      });
    } catch (error) {
      handleError();
    }
  };
  return [create];
};

export default useCreateDocument;
