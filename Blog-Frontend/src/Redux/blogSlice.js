import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

import axiosInstance from "../Helper/axiosInstance";

// Initial state for blog slice
const initialState = {
  trendingPosts: [],
  popularAuthorPosts: [],
  tags: [],
  allPosts: [],
  areMore: false,
  keywords: [],
  currentPost: {
    postDetails: {},
    recentPosts: []
  }
};

// Thunk to create a new post
export const createPost = createAsyncThunk("/", async (data) => {
  try {
    let res = axiosInstance.post("/blogs/create", data);
    toast.promise(res, {
      loading: "Loading...",
      success: "Blog Post created Successfully",
      error: "Failed to create the Post",
    });
    res = await res;
    return res.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

// Thunk to update a post
export const updatePost = createAsyncThunk("/update-post", async (allData) => {
  try {
    let res = axiosInstance.put(`/blogs/${allData.id}`, allData.data);
    toast.promise(res, {
      loading: "Updating...",
      success: "Blog Post updated Successfully",
      error: "Failed to update the Post",
    });
    res = await res;
    return res.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

// Thunk to get all home page blog posts
export const getHomePagePosts = createAsyncThunk("/get", async () => {
  try {
    const res = axiosInstance.get("/blogs/");
    const response = await res;
    return response.data.data;
  } catch (err) {
    toast.error(err?.response?.data?.message);
  }
});

// Thunk to get a single post
export const getPost = createAsyncThunk("/post/get", async (data) => {
  try {
    let res = axiosInstance.post(`/blogs/${data.url}`, data);
    toast.promise(res, {
      loading: "Loading...",
      success: (data) => data?.data?.message,
      error: "Failed to load the Post",
    });
    res = await res;
    return res.data;
  } catch (err) {
    toast.error(err?.response?.data?.message);
  }
});

// Thunk to get all blog posts
export const allblogposts = createAsyncThunk("/all-posts", async (skip = 0) => {
  try {
    const res = axiosInstance.get(`/blogs/posts?skip=${skip}`);
    const response = await res;
    return response?.data;
  } catch (err) {
    toast.error(err?.response?.data?.message);
  }
});

// Thunk to search for posts by tag
export const searchTag = createAsyncThunk("/all-posts/search", async (data) => {
  try {
    const res = axiosInstance.post("/blogs/tag", { tagsearch: data.tag, skip: data.skip ? data.skip : 0 });
    const response = await res;
    return response?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

// Thunk to unpublish a post
export const unPublishPost = createAsyncThunk("/unpublish", async (data) => {
  try {
    const res = axiosInstance.patch(`/blogs/${data.id}`);
    const response = await res;
    return response?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

// Thunk to publish a post
export const publishPost = createAsyncThunk("/publish", async (data) => {
  try {
    const res = axiosInstance.patch(`/blogs/publish/${data.id}`);
    const response = await res;
    return response?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

// Thunk to delete a post
export const deletePost = createAsyncThunk("/delete-post", async (data) => {
  try {
    const res = axiosInstance.delete(`/blogs/${data.id}`, data);
    toast.promise(res, {
      loading: "Deleting the post...",
      success: (data) => data?.data?.message,
      error: "Failed to delete the Post",
    });
    const response = await res;
    return response?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

// Blog slice
const blogSlice = createSlice({
    name: "blog",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getHomePagePosts.fulfilled, (state, action) => {
                if(action.payload){
                    state.trendingPosts = [...action.payload.trendingPosts];
                    state.popularAuthorPosts  = [...action.payload.authorPosts];
                    state.tags = [...action.payload.topKeywords].slice(0, 9);
                }
            })
            .addCase(allblogposts.fulfilled, (state, action) => {
                if(action.payload){
                    state.allPosts = [...action.payload.posts];
                    state.areMore = action.payload.areMore;
                    state.keywords = [...action.payload.keywords].slice(0, 10);
                }
            })
            .addCase(searchTag.fulfilled, (state, action) => {
                if(action.payload){
                    state.allPosts = [...action.payload.posts];
                    state.areMore = action.payload.areMore;
                    state.keywords = [...action.payload.keywords].slice(0, 10);
                }
            })
            .addCase(getPost.fulfilled, (state, action) => {
                if(action.payload){
                    state.currentPost.postDetails = action?.payload?.postDetails;
                    state.currentPost.recentPosts = action?.payload?.recentPosts;

                }
            })
    },
});


export const {} = blogSlice.actions;
export default blogSlice.reducer;