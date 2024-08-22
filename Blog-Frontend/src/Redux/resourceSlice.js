import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import axiosInstance from "../Helper/axiosInstance";

const initialState = {
    postArr : [],
}

// Thunk to upload a resource file
export const ResourceUpload = createAsyncThunk("/resource/", async (file) => {
    try {
        const formData = new FormData();
        formData.append("resource", file);
        let res = axiosInstance.post("/resource/", formData);
        toast.promise(res, {
            loading: "Uploading the file",
            success: (data) => data?.data?.message,
            error: "Failed to Create Account"
        })
        res = await res;
        return res.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

// Thunk to associate resources with a blog post
export const BlogResource = createAsyncThunk("/resource/blog/:id", async (data) => {
    try {
        if(data.resources.length < 1) return;
        data.resources = JSON.stringify(data.resources);
        let res = axiosInstance.post(`/resource/blog/${data.id}`, data);
        toast.promise(res, {
            loading: "Finalizing the Blog Post",
            success: "Blog post created Successfully",
            error: "Failed to finalize the blog post."
        })
        res = await res;
        return res.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

// Resource Slice
const resourceSlice = createSlice({
    name: "resource",
    initialState,
    reducers : {},
    extraReducers : (builder) => {
        builder
            // Update state when resource upload is successful
            .addCase(ResourceUpload.fulfilled, (state, action) => {
                state.postArr = [...state.postArr, action?.payload?.data?.id];
            })
            // Reset state when blog post is created
            .addCase(BlogResource.fulfilled, (state) => {
                state.postArr = [];
            })
    }
})

export const {} = resourceSlice.actions;
export default resourceSlice.reducer;