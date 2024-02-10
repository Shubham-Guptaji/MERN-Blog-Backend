import jwt from 'jsonwebtoken';

import AppError from "../utils/appError.js";
import asyncHandler from './async.middleware.js';

export const isLoggedIn = asyncHandler(async (req, res, next) => {
    try{
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ","");

        if(!token) {
            return next(new AppError("Unauthorized request", 401));
        }

        const decoded = jwt.verify(authtoken, process.env.JWT_SECRET);

        if(!decoded) {
            return next(new AppError("Unauthorized request", 401));
        }

        req.user = decoded;

        next();
    } catch {
        console.log("An error occurred while authenticating!");
        return next(new AppError("Something went wrong!", 500))
    }
})

export const autorizeRoles = (...roles) => {
    asyncHandler(async (req, _res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(
                new AppError("You don't have permission to view this route", 403)
            );
        }
        next();
    })
}
