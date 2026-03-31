import dayjs from 'dayjs';
import i18next from 'i18next';

import core from 'core';

import getLatestActivityDate from 'helpers/getLatestActivityDate';
import orientationManager from 'helpers/orientationManager';
import { rotateRad } from 'helpers/rotate';

import { DEFAULT_DATETIME_FORMAT } from 'constants/lumin-common';

export const SortValues = {
  POSITION: 'position',
  CREATED_DATE: 'createdDate',
};

export const ShowValues = {
  HIDE_NOTES: 'hideNotes',
  SHOW_ALL: 'showAll',
  SHOW_MY_NOTES: 'showMyNotes',
  EXPORT_MY_NOTES: 'exportMyNotes',
  EXPORT_ALL_MY_NOTES: 'exportAllMyNotes',
};

const Title = 'option.shared.page';

const sortedNoteByPosition = (notes) =>
  notes.sort((a, b) => {
    if (a.PageNumber === b.PageNumber) {
      // Quick fix for async sort strategies with realtime collab delete page
      // const rotation = orientationManager.getRotationRad(a.PageNumber);
      // const center = orientationManager.getDocumentCenter(a.PageNumber);
      const totalPage = core.docViewer && core.getTotalPages();
      const pageGetDimension = a.PageNumber > totalPage ? totalPage : a.PageNumber;
      const rotation = orientationManager.getRotationRad(pageGetDimension);
      const center = orientationManager.getDocumentCenter(pageGetDimension);

      /* ------- End --------- */

      // Simulated with respect to the document origin
      const rotatedA = [
        rotateRad(center.x, center.y, a.X, a.Y, rotation),
        rotateRad(center.x, center.y, a.X + a.Width, a.Y + a.Height, rotation),
      ];
      const rotatedB = [
        rotateRad(center.x, center.y, b.X, b.Y, rotation),
        rotateRad(center.x, center.y, b.X + b.Width, b.Y + b.Height, rotation),
      ];

      const smallestA = rotatedA.reduce(
        (smallest, current) => (current.y < smallest ? current.y : smallest),
        Number.MAX_SAFE_INTEGER
      );
      const smallestB = rotatedB.reduce(
        (smallest, current) => (current.y < smallest ? current.y : smallest),
        Number.MAX_SAFE_INTEGER
      );

      return smallestA - smallestB;
    }
    return a.PageNumber - b.PageNumber;
  });

const sortStrategies = {
  position: {
    getSortedNotes: (notes) => sortedNoteByPosition(notes),
    shouldRenderSeparator: (prevNote, currNote) => currNote?.PageNumber !== prevNote?.PageNumber,
    getSeparatorContent: (prevNote, currNote, { pageLabels }) =>
      `${i18next.t(Title)} ${pageLabels[currNote.PageNumber - 1]}`,
  },
  createdDate: {
    getSortedNotes: (notes) => notes.sort((a, b) => (b.DateCreated || 0) - (a.DateCreated || 0)),
    shouldRenderSeparator: (prevNote, currNote) => {
      const prevNoteDate = prevNote?.DateCreated;
      const currNoteDate = currNote.DateCreated;
      if (currNoteDate) {
        if (!prevNoteDate) {
          return true;
        }
        const dayFormat = DEFAULT_DATETIME_FORMAT;
        return dayjs(prevNoteDate).format(dayFormat) !== dayjs(currNoteDate).format(dayFormat);
      }
      return !(!prevNoteDate && !currNoteDate);
    },
    getSeparatorContent: (prevNote, currNote) => {
      const createdDate = currNote.DateCreated;
      if (createdDate) {
        const dayFormat = DEFAULT_DATETIME_FORMAT;
        const today = dayjs(new Date()).format(dayFormat);
        const yesterday = dayjs(new Date(new Date() - 86400000)).format(dayFormat);
        const createdDateString = dayjs(new Date(createdDate)).format(dayFormat);

        if (createdDateString === today) {
          return i18next.t('option.notesPanel.separator.today');
        }
        if (createdDateString === yesterday) {
          return i18next.t('option.notesPanel.separator.yesterday');
        }
        return createdDateString;
      }

      return i18next.t('option.notesPanel.separator.unknown');
    },
  },
  modifiedDate: {
    getSortedNotes: (notes) => notes.sort((a, b) => (getLatestActivityDate(b) || 0) - (getLatestActivityDate(a) || 0)),
    shouldRenderSeparator: (prevNote, currNote) => {
      const prevNoteDate = getLatestActivityDate(prevNote);
      const currNoteDate = getLatestActivityDate(currNote);
      if (prevNoteDate && currNoteDate) {
        const dayFormat = 'MMM D, YYYY';
        return dayjs(prevNoteDate).format(dayFormat) !== dayjs(currNoteDate).format(dayFormat);
      }

      return !prevNoteDate && !currNoteDate;
    },
    getSeparatorContent: (prevNote, currNote) => {
      const latestActivityDate = getLatestActivityDate(currNote);
      if (latestActivityDate) {
        const dayFormat = 'MMM D, YYYY';
        const today = dayjs(new Date()).format(dayFormat);
        const yesterday = dayjs(new Date(new Date() - 86400000)).format(dayFormat);
        const latestActivityDay = dayjs(latestActivityDate).format(dayFormat);

        if (latestActivityDay === today) {
          return i18next.t('option.notesPanel.separator.today');
        }
        if (latestActivityDay === yesterday) {
          return i18next.t('option.notesPanel.separator.yesterday');
        }
        return latestActivityDay;
      }

      return i18next.t('option.notesPanel.separator.unknown');
    },
  },
};

export const getSortStrategies = () => sortStrategies;

export const addSortStrategy = (newStrategy) => {
  const {
    name, getSortedNotes, shouldRenderSeparator, getSeparatorContent,
  } = newStrategy;

  sortStrategies[name] = {
    getSortedNotes,
    shouldRenderSeparator,
    getSeparatorContent,
  };
};
