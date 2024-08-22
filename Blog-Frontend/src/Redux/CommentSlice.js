import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import axiosInstance from "../Helper/axiosInstance";

// Initial state for comments
const initialState = {
  comments: [],
};

// Create a new comment
export const CreateComment = createAsyncThunk("/comments", async (data) => {
  try {
    let response = axiosInstance.post("/comments", data);
    toast.promise(response, {
      loading: "Adding your comment",
      success: "Commented on post successfully.",
      error: "Failed to comment on the blog post.",
    });
    response = await response;
    return response?.data;
  } catch (error) {
    toast.error(error.response.data.message);
  }
});

// Fetch comments for a blog post
export const fetchComments = createAsyncThunk("/fetch-comments", async (data) => {
  try {
    let response = await axiosInstance.get(`/comments/${data.blogId}`);
    return response?.data;
  } catch (error) {
    toast.error(error.response.data.message);
  }
});

// Delete a comment
export const deleteComment = createAsyncThunk("/comments/delete", async (data) => {
  try {
    let response = axiosInstance.delete(`/comments/${data}`);
    toast.promise(response, {
      loading: "Deleting your comment",
      success: "Deleted your comment successfully.",
      error: "Failed to delete comment on the blog post.",
    });
    response = await response;
    return response?.data;
  } catch (error) {
    toast.error(error.response.data.message);
  }
});

// Edit a comment
export const editComment = createAsyncThunk("/comment/edit", async (data) => {
  try {
    let response = axiosInstance.put(`/comments/${data.commentId}`, data);
    toast.promise(response, {
      loading: "Updating your comment",
      success: "Updated your comment successfully.",
      error: "Failed to update comment on the blog post.",
    });
    response = await response;
    return response?.data;
  } catch (error) {
    toast.error(error.response.data.message);
  }
});

// Create a slice for comments
const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchComments.fulfilled, (state, action) => {
      // Update comments in state when fetchComments is fulfilled
      state.comments = action?.payload?.comments;
    });
  },
});

export const {} = commentSlice.actions;
export default commentSlice.reducer;