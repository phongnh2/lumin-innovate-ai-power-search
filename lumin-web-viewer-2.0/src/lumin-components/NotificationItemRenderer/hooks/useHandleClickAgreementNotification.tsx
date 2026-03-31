import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import { useSignDocListMatch } from 'hooks';

import { ORG_TEXT } from 'constants/organizationConstants';
import { Routers } from 'constants/Routers';

type Params = {
  notification: {
    target: {
      targetData: {
        existAgreement: boolean;
        existAgreementGenDocuments: boolean;
        orgUrl: string;
      };
    };
    entity: {
      id: string;
    };
  };
};

const useHandleClickAgreementNotification = ({ notification }: Params) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isInSignDocListPage } = useSignDocListMatch();
  const { existAgreement, existAgreementGenDocuments, orgUrl } = notification.target?.targetData || {};

  const onClick = () => {
    if (existAgreement && !existAgreementGenDocuments) {
      navigate(`/${ORG_TEXT}/${orgUrl}/sign`);
      return;
    }

    if (!existAgreement && existAgreementGenDocuments) {
      navigate(`/${ORG_TEXT}/${orgUrl}/generate/documents/personal`);
      return;
    }

    if (existAgreement && existAgreementGenDocuments) {
      if (isInSignDocListPage) {
        navigate(`/${ORG_TEXT}/${orgUrl}/sign`);
      } else {
        navigate(`/${ORG_TEXT}/${orgUrl}/generate/documents/personal`);
      }
      return;
    }

    navigate(Routers.ORGANIZATION_LIST);
  };

  const handleClickRemoveMemberNotification = () => {
    dispatch(actions.removeOrganizationInListById(notification.entity.id));
    onClick();
  };

  return {
    handleClickTransferAgreementToAnotherOrg: onClick,
    handleClickRemoveMemberNotification,
  };
};

export default useHandleClickAgreementNotification;
