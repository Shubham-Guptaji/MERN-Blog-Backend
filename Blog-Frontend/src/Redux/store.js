import { configureStore } from "@reduxjs/toolkit";

import authSliceReducer from "../Redux/authSlice";
import blogSliceReducer from "../Redux/blogSlice";
import commentReducer from "../Redux/CommentSlice";
import miscReducer from "../Redux/Miscellaneous"
import resourceReducer from "../Redux/resourceSlice";

// Create a Redux store with combined reducers
const store = configureStore({
  reducer: {
    // Define reducers for each feature
    blog: blogSliceReducer,
    auth: authSliceReducer,
    resource: resourceReducer,
    misc: miscReducer,
    comment: commentReducer
  },
});

export default store;