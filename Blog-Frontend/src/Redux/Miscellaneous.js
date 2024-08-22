import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import axiosInstance from "../Helper/axiosInstance";

const initialState = {
    postLikes: null,
    isLiked : null,
    isFollowing: null,
    followId: null,
    followers: null,
    meFollow: null,
}

// Component for counting total like on a post
export const PostLike = createAsyncThunk("/likecount", async (data) => {
    try {
        let res = axiosInstance.post('/likecount', data);
          res = await res;
          return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

// Component to like a certain post
export const LikeHandler = createAsyncThunk("/like", async (data) => {
    try {
        let res = axiosInstance.get(`/like/${data.postId}`);
        toast.promise(res, {
          loading: "Loading...",
          success: (data) => {
            return data?.data?.message;
          },
          error: "Failed to like the post",
        });
        res = await res;
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

// Component to dislike a certain post
export const DisLikeHandler = createAsyncThunk("/dislike", async (data) => {
    try {
        let res = axiosInstance.delete(`/dislike/${data.postId}`);
        toast.promise(res, { 
          loading: "Loading...",
          success: (data) => {
            return data?.data?.message;
          },
          error: "Failed to unlike the post",
        });
        res = await res;
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

// Component to know if current user is following the author
export const IsFollowing = createAsyncThunk("/isfollowing", async (data) => {
    try {
        let res = axiosInstance.post(`/isfollowing/`, data);
        res = await res;
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

// Component to follow the post author
export const Follow = createAsyncThunk("/follow", async (data) => {
    try {
        let res = axiosInstance.post(`/follower/follow`, data);
        toast.promise(res, { 
          loading: "Loading...",
          success: (data) => {
            return data?.data?.message;
          },
          error: "Failed to follow the author.",
        });
        res = await res;
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

// Component to follow an author
export const UnFollow = createAsyncThunk("/unfollow", async (data) => {
    try {
        let res = axiosInstance.delete(`/follower/unfollow/${data.FollowId}`, data);
        toast.promise(res, { 
          loading: "Loading...",
          success: (data) => {
            return data?.data?.message;
          },
          error: "Failed to get the follow status",
        });
        res = await res;
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

// Component to get list of current user's followers
export const myFollowers = createAsyncThunk("/my-followers", async (data) => {
    try {
        let skip = data?.skip || 0;
        let res = axiosInstance.get(`/followers?skip=${skip}`);
        toast.promise(res, {
            loading: "Getting your followers",
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to get the followers"
        });
        res = await res;
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

// Component to list all the authors whom current user follows
export const meFollowing = createAsyncThunk("/me-following", async (data) => {
    try {
        let skip = data?.skip || 0;
        let res = axiosInstance.get(`/following?skip=${skip}`);
        toast.promise(res, {
            loading: "Getting your followed Authors",
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to get the followed Authors."
        });
        res = await res;
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

// Miscellaneous Slice
const miscSlice = createSlice({
    name: "misc",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(PostLike.fulfilled, (state, action) => {
                state.postLikes = action?.payload?.data?.totalLikes;
                state.isLiked = action?.payload?.data?.isLiked;
                
            })
            .addCase(LikeHandler.fulfilled, (state, action) => {
                state.postLikes = action?.payload?.data?.totalLikes;
                state.isLiked = action?.payload?.data?.isLiked;
            })
            .addCase(DisLikeHandler.fulfilled, (state, action) => {
                state.postLikes = action?.payload?.data?.totalLikes;
                state.isLiked = action?.payload?.data?.isLiked;
            })
            .addCase(IsFollowing.fulfilled, (state, action) => {
                state.isFollowing = action?.payload?.data?.isFollowing;
                state.followId = action?.payload?.data?.id;
            })
            .addCase(Follow.fulfilled, (state, action) => {
                state.isFollowing = true;
                state.followId = action?.payload?.id;
            })
            .addCase(UnFollow.fulfilled, (state) => {
                state.isFollowing = false;
                state.followId = null;
            })
            .addCase(myFollowers.fulfilled, (state, action) => {
                state.followers = action?.payload;
            })
            .addCase(meFollowing.fulfilled, (state, action) => {
                state.meFollow = action?.payload;
            })
    }
})

export const {} = miscSlice.actions;
export default miscSlice.reducer;