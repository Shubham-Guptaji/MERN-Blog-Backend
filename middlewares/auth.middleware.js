import jwt from 'jsonwebtoken';

import AppError from "../utils/appError.js";
import asyncHandler from './async.middleware.js';


// Check if user is logged in
export const isLoggedIn = asyncHandler(async (req, _, next) => {
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token) {
            return next(new AppError("Token not found", 401));
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if(!decoded) {
            return next(new AppError("Invalid token", 401));
        }

        req.user = decoded;

        if(req.user.isClosed) {
            return next(new AppError("This account is closed. Please Login again to open the account", 403))
        }
        if(req.user.isBlocked) {
            return next(new AppError("This account has been blocked", 403))
        }

        next();
    } catch (err){
        return next(new AppError("Invalid Token", 400))
    }
})

// Check if user is verified
export const isVerified = asyncHandler(async function(req, _, next) {
    if(req.user.isVerified) return next();
    next(new AppError("This account is not verified. Please verify your account", 403));
})

// Check if user is admin
export const isAdmin = asyncHandler(async function(req, _, next) {
    if(req.user.role === "admin") return next();
    next(new AppError("Your request can not be processed", 403));
})

