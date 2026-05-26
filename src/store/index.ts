import { configureStore } from '@reduxjs/toolkit';
import authentificationSlice from './authentification/slice';
import registerReducer from './register/slice';
import passwordReducer from './password/slice';
import citySlice from './city/slice';
import categorySlice from './category/slice';
import userSlice from './user/slice';
import reviewSlice from './review/slice';
import notificationSlice from './notification/slice';
import contactSlice from './contact/slice';
import favoriteSlice from './favorite/slice';
import productSlice from './product/slice';
import forfaitSlice from './forfait/slice';
import paymentSlice from './payment/slice';
import heroBannerSlice from './heroBanner/slice';
import type { PersistConfig } from 'redux-persist';
import { persistStore, persistReducer } from 'redux-persist';
import secureStorage from '../utils/secureStorage';

// Configuration de persistance pour l'authentification
const authPersistConfig: PersistConfig<
  ReturnType<typeof authentificationSlice.reducer>
> = {
  key: 'buyAndSale-auth',
  storage: secureStorage,
  whitelist: ['auth'], // Persister uniquement le state 'auth'
  version: 1,
};

// Créer le reducer persisté pour l'authentification
const persistedAuthReducer = persistReducer(
  authPersistConfig,
  authentificationSlice.reducer
);

// Configuration du store
export const store = configureStore({
  reducer: {
    [authentificationSlice.name]: persistedAuthReducer,
    register: registerReducer,
    password: passwordReducer,
    city: citySlice.reducer,
    category: categorySlice.reducer,
    user: userSlice.reducer,
    review: reviewSlice,
    notification: notificationSlice,
    contact: contactSlice,
    favorite: favoriteSlice,
    product: productSlice,
    forfait: forfaitSlice,
    payment: paymentSlice,
    [heroBannerSlice.name]: heroBannerSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Créer le persistor
export const persistor = persistStore(store);

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
