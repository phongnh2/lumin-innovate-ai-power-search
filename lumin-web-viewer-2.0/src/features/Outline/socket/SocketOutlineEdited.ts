import { SocketOutlineManipulation } from "./SocketOutlineManipulation";
import { TUpdateDocumentOutlinesParams } from "../types";

export class SocketOutlineEdited extends SocketOutlineManipulation {
  processOutlineUpdate(data: TUpdateDocumentOutlinesParams): void {
    const { updatedOutlines, pathId } = data;
    const { name, pageNumber, verticalOffset, horizontalOffset } = updatedOutlines[0];
    const node = this.getNodeByPathId(pathId);
    if (!node) {
      return;
    }
    node.model.name = name;
    node.model.horizontalOffset = horizontalOffset;
    node.model.pageNumber = pageNumber;
    node.model.verticalOffset = verticalOffset;
  }
}
