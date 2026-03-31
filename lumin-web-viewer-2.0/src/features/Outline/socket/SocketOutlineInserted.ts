import { TDocumentOutline } from "interfaces/document/document.interface";

import { SocketOutlineManipulation } from "./SocketOutlineManipulation";
import { TUpdateDocumentOutlinesParams } from "../types";

export class SocketOutlineInserted extends SocketOutlineManipulation {
  processOutlineUpdate(data: TUpdateDocumentOutlinesParams): void {
    const { isSubOutline, refId, updatedOutlines } = data;
    const node = this.createNode(updatedOutlines[0] as TDocumentOutline);
    const refNode = this.getNodeByPathId(refId);
    if (!refNode) {
      this.getRoot().addChild(node);
      return;
    }
    if (isSubOutline) {
      refNode.addChild(node);
      return;
    }
    const refNodeIndex = refNode.getIndex();
    refNode.parent.addChildAtIndex(node, refNodeIndex + 1);
  }
}
