import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { leftSideBarActions, leftSideBarSelectors } from '@new-ui/components/LuminLeftSideBar/slices';

import selectors from 'selectors';

import { useCleanup } from 'hooks/useCleanup';

import { quickSearchSelectors, setIsOpenQuickSearch } from 'features/QuickSearch/slices';

import { TOOLS_NAME } from 'constants/toolsName';

import PlaceMultipleTime from './PlaceMultipleTime';
import RequestSignature from './RequestSignature';
import { SignatureListPopoverContentContext } from './SignatureListPopoverContentContext';
import YourSignatures from './YourSignatures';

import * as Styled from './SignatureListPopoverContent.styled';

const SignatureListPopoverContent = ({ closePopper, onlyAllowRequest }) => {
  const dispatch = useDispatch();
  const contextValue = useMemo(() => ({ closePopper }), [closePopper]);
  const activeToolName = useSelector(selectors.getActiveToolName);
  const isOpenQuickSearch = useSelector(quickSearchSelectors.isOpenQuickSearch);
  const isLeftSidebarPopoverOpened = useSelector(leftSideBarSelectors.isLeftSidebarPopoverOpened);

  useCleanup(() => {
    if ((isOpenQuickSearch || isLeftSidebarPopoverOpened) && activeToolName === TOOLS_NAME.SIGNATURE) {
      dispatch(setIsOpenQuickSearch(false));
      dispatch(leftSideBarActions.setHoveredNavigationTabs(null));
      dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(false));
    }
  }, [activeToolName]);

  return (
    <SignatureListPopoverContentContext.Provider value={contextValue}>
      <Styled.Wrapper className="signature-popover-content">
        <RequestSignature onlyAllowRequest={onlyAllowRequest} />
        {!onlyAllowRequest && (
          <>
            <YourSignatures />
            <PlaceMultipleTime />
          </>
        )}
      </Styled.Wrapper>
    </SignatureListPopoverContentContext.Provider>
  );
};

SignatureListPopoverContent.propTypes = {
  closePopper: PropTypes.func.isRequired,
  onlyAllowRequest: PropTypes.bool.isRequired,
};

export default SignatureListPopoverContent;
