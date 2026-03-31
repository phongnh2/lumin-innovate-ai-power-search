import { ICannyCategory } from './canny-category.interface';
import { ICannyTag } from './canny-tag.interface';

export interface ICannyPost {
  id: string;
  title: string;
  url: string;
  status: string[];
  category?: ICannyCategory;
  tags?: ICannyTag[];
}

export interface ICannyCreatePostResponse {
  id: string
}
