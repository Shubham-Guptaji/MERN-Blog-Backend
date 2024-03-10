import rateLimit from "express-rate-limit";
import AppError from "./appError.js";

const rate = function ( windowMs, max) {
    return rateLimit({
      windowMs: windowMs,
      max: max,
      message: `Max request exceeded. Please try again after ${windowMs / 1000 / 60} minutes`,
      handler: (req, res, next) => {
        return next(new AppError(`Max request exceeded. Please try again after ${windowMs / 1000 / 60} minutes`, 429));
      }
    });
  }

export default rate;