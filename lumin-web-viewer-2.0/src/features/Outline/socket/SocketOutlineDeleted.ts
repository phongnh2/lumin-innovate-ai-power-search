import { SocketOutlineManipulation } from "./SocketOutlineManipulation";
import { TUpdateDocumentOutlinesParams } from "../types";

export class SocketOutlineDeleted extends SocketOutlineManipulation {
  processOutlineUpdate(data: TUpdateDocumentOutlinesParams): void {
    const { pathId } = data;
    const node = this.getNodeByPathId(pathId);
    if (!node) {
      return;
    }
    node.drop();
  }
}
