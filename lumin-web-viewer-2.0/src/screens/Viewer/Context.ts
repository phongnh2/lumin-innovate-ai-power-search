import React from 'react';

export interface OnlineMember {
  _id: string;
  name: string;
  avatarRemoteId: string;
  isActive: boolean;
}

export interface BookmarkIns {
  reGenerateBookmarks: () => void;
  generateBookmarks: () => void;
  bookmarksUser: Record<string, any>;
  prevBookmarks: Record<string, any> | null;
  updatePositionOfBookmark: (params: {
    type: string;
    option: {
      numberOfPageToMerge: number;
      positionToMerge: number;
    };
  }) => void;
}

type ViewerContextType = {
  refetchDocument: (callback: (document: any) => any) => void;
  reloadDocument: () => void;
  reloadDocumentToViewer: () => Promise<void>;
  openDocumentRevision: () => Promise<void>;
  openPreviewOriginalVersion: () => Promise<void>;
  onlineMembers: OnlineMember[];
  bookmarkIns: BookmarkIns;
  deletedPageToastId: string;
};

const ViewerContext = React.createContext<ViewerContextType>({
  refetchDocument: () => {},
  reloadDocument: () => {},
  reloadDocumentToViewer: async () => {},
  openDocumentRevision: async () => {},
  openPreviewOriginalVersion: async () => {},
  onlineMembers: [],
  bookmarkIns: {
    reGenerateBookmarks: () => {},
    generateBookmarks: () => {},
    bookmarksUser: {},
    prevBookmarks: null,
    updatePositionOfBookmark: () => {},
  },
  deletedPageToastId: '',
});

export default ViewerContext;
