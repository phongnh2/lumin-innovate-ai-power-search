import { Row } from '@fast-csv/format';

import { IEventBody } from 'Event/interfaces/event.interface';
import { User } from 'User/interfaces/user.interface';

export interface IExportedDateTime {
  date: string
  time: string
}

export interface IEventExporter {
  headers: string[]
  prefix: string
  user: User
  getFileName(): string
  export(events: IEventBody[]): Promise<string>
  formatEventsToRows(events: IEventBody[], startedIndex?: number) : Row[]
  extractEventDateAndTime(event: IEventBody) : IExportedDateTime
}
