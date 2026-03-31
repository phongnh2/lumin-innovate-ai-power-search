/* eslint-disable class-methods-use-this */
import { SocketOutlineManipulation } from "./SocketOutlineManipulation";
import { OutlineMovePosition, TUpdateDocumentOutlinesParams, TreeNode } from "../types";
import { OutlineStoreUtils } from "../utils/outlineStore.utils";

export class SocketOutlineMoved extends SocketOutlineManipulation {
  private moveNodeBetweenSiblings({ targetNode, refNode, targetIndex }: { targetNode: TreeNode; refNode: TreeNode; targetIndex: number }): void {
    refNode.parent.addChildAtIndex(targetNode, targetIndex);
    targetNode.model.level = refNode.model.level;
    targetNode.model.parentId = refNode.model.parentId;
    if (targetNode.hasChildren()) {
      for (let i = 0; i < targetNode.children.length; i++) {
        OutlineStoreUtils.modifyNodeLevel(targetNode.children[i]);
      }
    }
  }

  processOutlineUpdate(data: TUpdateDocumentOutlinesParams): void {
    const { movePosition, pathId, refId } = data;
    const node = this.getNodeByPathId(pathId);
    const refNode = this.getNodeByPathId(refId);
    if (!node || !refNode) {
      return;
    }

    const targetNode = OutlineStoreUtils.cloneNode(node);
    const refNodeIndex = refNode.getIndex();

    switch (movePosition) {
      case OutlineMovePosition.Up: {
        this.moveNodeBetweenSiblings({ targetNode, refNode, targetIndex: refNodeIndex });
        break;
      }
      case OutlineMovePosition.Down: {
        this.moveNodeBetweenSiblings({ targetNode, refNode, targetIndex: refNodeIndex + 1 });
        break;
      }
      case OutlineMovePosition.Into: {
        refNode.addChild(targetNode);
        targetNode.model.parentId = refNode.model.pathId;
        OutlineStoreUtils.modifyNodeLevel(targetNode);
        break;
      }
      default:
        break;
    }

    node.drop();
  }
}
