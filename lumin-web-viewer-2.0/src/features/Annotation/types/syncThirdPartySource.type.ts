import { SyncThirdPartySource } from '../constants/syncThirdPartySource.enum';

export type SyncThirdPartySourceType = typeof SyncThirdPartySource[keyof typeof SyncThirdPartySource];
