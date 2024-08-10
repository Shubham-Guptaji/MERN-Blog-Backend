import cookieParser from "cookie-parser";
import express from "express";
import { config } from "dotenv";
config(); // Load environment variables from .env file
import cors from 'cors';
import morgan from 'morgan';
import errorMiddleware from "./middlewares/error.middleware.js";
import redis from 'redis';

const app = express();

// Set up JSON and URL-encoded body parsing
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({extended: true}));

// Enable CORS for frontend URL
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
  })
)

// Create Redis client
export const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
});

// Set up logging and cookie parsing
app.use(morgan('dev')); // Use 'dev' logging format for development
app.use(cookieParser());

// Simple ping endpoint
app.get('/ping',(_req, res) => {
  res.send('Pong');
})

// Import and mount routes
import userRoutes from './routes/user.routes.js';
import blogRoutes from './routes/blog.routes.js';
import commentRoutes from './routes/comments.routes.js';
import resourceRoutes from './routes/resources.routes.js';
import miscRoutes from './routes/miscellaneous.routes.js';

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/resource', resourceRoutes)
app.use('/api/v1', miscRoutes);

// Catch-all 404 handler
app.all('*', (_req, res) => {
  res.status(404).send('OOPS!!! 404 Page Not Found');
});

// Error handling middleware
app.use(errorMiddleware);

export default app;