import { configureStore } from '@reduxjs/toolkit';

import { createAPI } from '../api';
import { rootReducer } from './root-reducer';
import { fetchOffers, fetchFavoriteOffers, fetchUserStatus } from './action';
import history from '../history';
import { Token } from '../utils';
import { setAuthorizationStatus } from './user-process/user-process';
import { AuthorizationStatus } from '../const';

const api = createAPI();
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    thunk: {
      extraArgument: {
        api,
        history
      },
    },
  }),
});

store.dispatch(fetchOffers());

const token = Token.get();

if (token) {
  store.dispatch(fetchUserStatus());
  store.dispatch(fetchFavoriteOffers());
} else {
  store.dispatch(setAuthorizationStatus(AuthorizationStatus.NoAuth));
}

export default store;
