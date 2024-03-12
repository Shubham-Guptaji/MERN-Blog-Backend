import cookieParser from "cookie-parser";
import express from "express";
import { config } from "dotenv";
config();
import cors from 'cors';
import morgan from 'morgan';
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({extended: true}));

app.use(
    cors({
        origin: [process.env.FRONTEND_URL],
        credentials: true
    })
)

app.use(morgan('dev')); // combine for production dev for development 
app.use(cookieParser());

app.get('/ping',(_req, res) => {
    res.send('Pong');
})

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


app.all('*', (_req, res) => {
    res.status(404).send('OOPS!!! 404 Page Not Found');
});

app.use(errorMiddleware);

export default app;
