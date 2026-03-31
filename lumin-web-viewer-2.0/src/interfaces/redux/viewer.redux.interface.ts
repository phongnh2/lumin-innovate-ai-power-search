export interface IPresenterModeState {
  isInPresenterMode: boolean;
  restoreState: {
    viewControlDisplayMode: Core.DisplayModes;
    pageEditDisplayMode: string;
  };
}
