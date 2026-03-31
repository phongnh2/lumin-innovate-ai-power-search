export interface ViewerNavigationState {
  isExpanded: boolean;
}

export interface RecentDocumentItem {
  _id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}
