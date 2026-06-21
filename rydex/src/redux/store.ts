import { configureStore } from '@reduxjs/toolkit'
// ...
import userReducer from './userSlice'


// useSelector - to get data from store
// useDispatch - to dispatch actions (update state)
// slice - collection of actions and reducers
// action - event that triggers state update
// reducer - function that updates state
// store - collection of slices
export const store = configureStore({
  reducer: {
    user: userReducer
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch