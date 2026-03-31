import { useSearchParam } from 'react-use';

import { useViewerMatch } from 'hooks/useViewerMatch';

import { ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { UrlSearchParam } from 'constants/UrlSearchParam';

type TOpenFrom = 'header' | 'sidebar' | 'share_link';

const useCopyLinkPurpose = (type: 'primary' | 'secondary'): string => {
  const { isViewer } = useViewerMatch();
  const openModalParam = useSearchParam(UrlSearchParam.OPEN_MODAL_FROM) as TOpenFrom;
  const isPrimary = type === 'primary';
  if (!isViewer) {
    if (isPrimary) {
      return ButtonPurpose.COPY_LINK_ON_DOCUMENT_LIST;
    }
    return ButtonPurpose.COPY_LINK_ON_DOCUMENT_LIST_DROPDOWN;
  }

  switch (openModalParam) {
    case 'share_link':
      return ButtonPurpose.COPY_LINK_FROM_COPY_LINK_ON_SIDEBAR;
    case 'sidebar': {
      if (isPrimary) {
        return ButtonPurpose.COPY_LINK_ON_SIDEBAR;
      }
      return ButtonPurpose.COPY_LINK_FROM_SHARE_LINK_ON_SIDEBAR;
    }
    case 'header': {
      if (isPrimary) {
        return ButtonPurpose.COPY_LINK_ON_HEADER;
      }
      return ButtonPurpose.COPY_LINK_FROM_SHARE_LINK_ON_HEADER;
    }
    default:
      return '';
  }
};

export default useCopyLinkPurpose;
