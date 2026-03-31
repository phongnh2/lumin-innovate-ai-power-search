import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import actions from 'actions';

import Crash from 'luminComponents/Crash';

import { BASEURL } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

function TechnicalIssue(): JSX.Element {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);
  const wrongEmail = searchParams.get(UrlSearchParam.WRONG_EMAIL);
  const requireOrgMembership = searchParams.get(UrlSearchParam.REQUIRE_ORG_MEMBERSHIP);
  const onOk = (): void => {
    const googleAccountUrl = searchParams.get('next_url');
    const url: string = googleAccountUrl ? decodeURIComponent(googleAccountUrl) : (BASEURL as string);
    window.open(url, '_self');
  };
  useEffect(() => {
    if (wrongEmail) {
      dispatch(actions.setWrongIpStatus({ email: wrongEmail, open: true }));
      searchParams.delete(UrlSearchParam.WRONG_EMAIL);
      navigate('/', { replace: true });
    }
    if (requireOrgMembership) {
      const email = searchParams.get(UrlSearchParam.EMAIL);
      dispatch(actions.setMembershipOfOrg({ require: true, email }));
      searchParams.delete(UrlSearchParam.REQUIRE_ORG_MEMBERSHIP);
      searchParams.delete(UrlSearchParam.EMAIL);
      navigate('/', { replace: true });
    }
  });
  return <Crash onOk={onOk} />;
}

export default TechnicalIssue;
