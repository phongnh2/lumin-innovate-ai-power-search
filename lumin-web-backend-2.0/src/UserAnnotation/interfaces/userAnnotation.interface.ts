import { UserAnnotationType } from 'UserAnnotation/userAnnotation.enum';

export interface IUserAnnotation {
  _id: string;
  type: UserAnnotationType,
  ownerId: string;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRubberStamp extends IUserAnnotation {
  property: {
    bold: boolean,
    italic: boolean,
    strikeout: boolean,
    underline: boolean,
    title: string,
    subtitle: string,
    color: string,
    textColor: string,
    font: string,
  },
}
