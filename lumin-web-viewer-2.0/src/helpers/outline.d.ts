declare namespace OutlineUtils {
  function addRootOutline(newName: string, pageNum: number, x: number, y: number, zoom: number): Promise<string>;
  function addNewOutline(
    newName: string,
    isAddSub: boolean,
    path: string,
    pageNum: number,
    x: number,
    y: number,
    zoom: number
  ): Promise<string>;
  function getNestedLevel(outline: Core.Bookmark): number;
}

export default OutlineUtils;
