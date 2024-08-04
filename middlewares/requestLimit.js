import rateLimit from "express-rate-limit";
import AppError from "../utils/appError.js";

const rate = function ( windowMs, max) {
    return rateLimit({
      windowMs: windowMs * 60 * 1000,
      max: max,
      message: `Max request exceeded. Please try again after ${windowMs} minutes`,
      handler: (req, res, next) => {
        return next(new AppError(`Max request exceeded. Please try again after ${windowMs} minutes`, 429));
      }
    });
  }

export default rate;