import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
  Notification,
} from './actions';

// ===============================
// LOADING STATES
// ===============================

export enum LoadingType {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

// ===============================
// STATE INTERFACE
// ===============================

export interface NotificationState {
  items: Notification[];
  unreadCount: number;
  status: LoadingType;
  error: string | null;
  markAsReadStatus: LoadingType;
  markAllAsReadStatus: LoadingType;
}

// ===============================
// INITIAL STATE
// ===============================

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  status: LoadingType.IDLE,
  error: null,
  markAsReadStatus: LoadingType.IDLE,
  markAllAsReadStatus: LoadingType.IDLE,
};

// ===============================
// SLICE
// ===============================

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Ajouter une nouvelle notification (pour usage futur avec push notifications)
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    // Réinitialiser l'état des erreurs
    clearNotificationError: (state) => {
      state.error = null;
    },
    // Réinitialiser les statuts
    resetMarkAsReadStatus: (state) => {
      state.markAsReadStatus = LoadingType.IDLE;
    },
    resetMarkAllAsReadStatus: (state) => {
      state.markAllAsReadStatus = LoadingType.IDLE;
    },
  },
  extraReducers: (builder) => {
    // ===============================
    // FETCH NOTIFICATIONS
    // ===============================
    builder
      .addCase(fetchNotificationsAction.pending, (state) => {
        state.status = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(
        fetchNotificationsAction.fulfilled,
        (state, action: PayloadAction<Notification[]>) => {
          state.status = LoadingType.SUCCEEDED;
          state.items = action.payload;
          state.unreadCount = action.payload.filter((item) => !item.read).length;
          state.error = null;
        }
      )
      .addCase(fetchNotificationsAction.rejected, (state, action) => {
        state.status = LoadingType.FAILED;
        state.error = action.payload?.message || 'Failed to fetch notifications';
      });

    // ===============================
    // MARK AS READ
    // ===============================
    builder
      .addCase(markAsReadAction.pending, (state) => {
        state.markAsReadStatus = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(
        markAsReadAction.fulfilled,
        (state, action: PayloadAction<Notification>) => {
          state.markAsReadStatus = LoadingType.SUCCEEDED;
          
          // Mettre à jour la notification dans la liste
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index !== -1) {
            const wasUnread = !state.items[index].read;
            state.items[index] = action.payload;
            
            // Décrémenter le compteur seulement si la notification était non lue
            if (wasUnread && action.payload.read) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          }
          
          state.error = null;
        }
      )
      .addCase(markAsReadAction.rejected, (state, action) => {
        state.markAsReadStatus = LoadingType.FAILED;
        state.error = action.payload?.message || 'Failed to mark notification as read';
      });

    // ===============================
    // MARK ALL AS READ
    // ===============================
    builder
      .addCase(markAllAsReadAction.pending, (state) => {
        state.markAllAsReadStatus = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(markAllAsReadAction.fulfilled, (state) => {
        state.markAllAsReadStatus = LoadingType.SUCCEEDED;
        
        // Marquer toutes les notifications comme lues
        state.items.forEach((item) => {
          item.read = true;
        });
        
        // Réinitialiser le compteur
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(markAllAsReadAction.rejected, (state, action) => {
        state.markAllAsReadStatus = LoadingType.FAILED;
        state.error = action.payload?.message || 'Failed to mark all notifications as read';
      });
  },
});

export const {
  addNotification,
  clearNotificationError,
  resetMarkAsReadStatus,
  resetMarkAllAsReadStatus,
} = notificationSlice.actions;

export default notificationSlice.reducer;
