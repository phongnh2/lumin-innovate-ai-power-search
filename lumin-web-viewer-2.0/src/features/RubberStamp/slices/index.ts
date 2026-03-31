import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RubberStampItem } from '../interfaces';

const initialState = {
  stamps: null,
} as {
  stamps: RubberStampItem[] | null;
};

export const rubberStampSlice = createSlice({
  name: 'RUBBER_STAMP',
  initialState,
  reducers: {
    setStamps: (state, action: PayloadAction<RubberStampItem[]>) => {
      state.stamps = action.payload;
    },
  },
});

export const selectStamps = (state: { rubberStamp: { stamps: RubberStampItem[] | null } }) => state.rubberStamp.stamps;

export const { setStamps } = rubberStampSlice.actions;

export default rubberStampSlice.reducer;
