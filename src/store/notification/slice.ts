import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
  Notification,
} from './actions';

export enum LoadingType {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

export interface NotificationState {
  items: Notification[];
  unreadCount: number;
  status: LoadingType;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  status: LoadingType.IDLE,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsAction.pending, (state) => {
        state.status = LoadingType.LOADING;
      })
      .addCase(
        fetchNotificationsAction.fulfilled,
        (state, action: PayloadAction<Notification[]>) => {
          state.status = LoadingType.SUCCEEDED;
          state.items = action.payload;
          state.unreadCount = action.payload.filter((item) => !item.read).length;
        }
      )
      .addCase(fetchNotificationsAction.rejected, (state) => {
        state.status = LoadingType.FAILED;
      });

    builder
      .addCase(
        markAsReadAction.fulfilled,
        (state, action: PayloadAction<Notification>) => {
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index !== -1) {
            const wasUnread = !state.items[index].read;
            state.items[index] = action.payload;
            if (wasUnread && action.payload.read) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          }
        }
      );

    builder
      .addCase(markAllAsReadAction.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.read = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
