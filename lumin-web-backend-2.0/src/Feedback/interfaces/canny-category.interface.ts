import { ICannyBoard } from './canny-board.interface';

export interface ICannyCategory {
  id: string;
  name: string;
  board: ICannyBoard;
}
