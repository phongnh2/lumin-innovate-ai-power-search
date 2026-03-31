class PromoteTemplatesController {
  private visited = true;

  private hasShownPopover = false;

  getState() {
    return {
      visited: this.visited,
      hasShownPopover: this.hasShownPopover,
    };
  }

  setVisited(visited: boolean) {
    this.visited = visited;
  }

  setHasShownPopover(hasShownPopover: boolean) {
    this.hasShownPopover = hasShownPopover;
  }
}

export const promoteTemplatesController = new PromoteTemplatesController();
