import { ListMagnifyingGlassIcon } from '@luminpdf/icons/dist/csr/ListMagnifyingGlass';
import { MenuItem } from 'lumin-ui/kiwi-ui';
import { motion } from 'motion/react';
import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { LayoutElements } from '@new-ui/constants';

import actions from 'actions';

import fireEvent from 'helpers/fireEvent';

import { CUSTOM_EVENT } from 'constants/customEvent';

const SearchInDocument = ({ keyword }: { keyword: string }) => {
  const dispatch = useDispatch();

  if (!keyword) {
    return null;
  }

  const onClick = () => {
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.SEARCH,
      isOpen: true,
    });
    dispatch(actions.setSearchValue(keyword));
    dispatch(actions.setSearchOverlayValue(true));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <MenuItem
        leftSection={<ListMagnifyingGlassIcon size={24} color="var(--kiwi-colors-surface-on-surface)" />}
        onClick={onClick}
      >
        <Trans
          i18nKey="viewer.quickSearch.searchInDoc"
          values={{ keyword }}
          components={{
            keyword: <span style={{ color: 'var(--kiwi-colors-surface-on-surface-low)' }} />,
          }}
        />
      </MenuItem>
    </motion.div>
  );
};

export default SearchInDocument;
