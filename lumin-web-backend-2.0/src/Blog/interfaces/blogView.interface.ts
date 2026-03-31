import { LanguageEnum } from 'Blog/blogView.enum';

export interface IBlogViewModel {
  url: string;
  views: number;
  language: LanguageEnum;
  author: string;
}

export interface IBlogView extends IBlogViewModel {
  _id: string;
}
