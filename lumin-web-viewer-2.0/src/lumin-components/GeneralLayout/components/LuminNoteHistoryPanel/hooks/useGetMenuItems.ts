import { ShowValues, SortValues } from 'features/Comments/constants';

import { IUser } from 'interfaces/user/user.interface';

const sortTitle = 'viewer.commentsHistoryPanel.sortOptions';

const noteTitle = 'viewer.notePanel';

export const ExportOptionList = [
  {
    title: `${noteTitle}.selectMyNotesToExport`,
    value: ShowValues.EXPORT_MY_NOTES,
  },
  {
    title: `${noteTitle}.exportAllMyNotes`,
    value: ShowValues.EXPORT_ALL_MY_NOTES,
  },
  {
    divider: true,
    value: '',
  },
  {
    title: `${sortTitle}.showOnlyMyNotes`,
    value: ShowValues.SHOW_MY_NOTES,
  },
];

export const useGetMenuItems = (currentUser: IUser) => {
  const options = [
    {
      title: `${sortTitle}.sortByPosition`,
      value: SortValues.POSITION,
    },
    {
      title: `${sortTitle}.sortByCreatedDate`,
      value: SortValues.CREATED_DATE,
    },
    {
      divider: true,
      value: '',
    },
    {
      title: `${sortTitle}.hideNotes`,
      value: ShowValues.HIDE_NOTES,
    },
  ];

  const exportMyNoteOption = {
    title: `${noteTitle}.myNotes`,
    value: '',
    options: ExportOptionList,
  };

  return [...options, currentUser && exportMyNoteOption].filter(Boolean);
};
