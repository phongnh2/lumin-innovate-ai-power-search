import { CropPageAction } from './crop';
import { DeletePageAction } from './delete';
import { InsertPageAction } from './insert';
import { MovePageAction } from './move';

export class Manipulation {
  static createInsertPageAction(insertPages: number[]): InsertPageAction {
    return new InsertPageAction(insertPages);
  }

  static createDeletePageAction(
    deletePages: number[],
    deletedWidgets: Core.Annotations.WidgetAnnotation[]
  ): DeletePageAction {
    return new DeletePageAction(deletePages, deletedWidgets);
  }

  static createMovePageAction(from: number, to: number): MovePageAction {
    return new MovePageAction(from, to);
  }

  static createCropPageAction(deletedWidgets: Core.Annotations.WidgetAnnotation[]): CropPageAction {
    return new CropPageAction(deletedWidgets);
  }
}
