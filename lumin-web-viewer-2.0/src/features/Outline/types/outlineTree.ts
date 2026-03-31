import { TDocumentOutline } from "interfaces/document/document.interface";

export type TMoveOutlineHandler = ({
  dragOutline,
  dropOutline,
}: {
  dragOutline: TDocumentOutline;
  dropOutline: TDocumentOutline;
}) => void;
