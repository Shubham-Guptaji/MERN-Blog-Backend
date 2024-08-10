// Import required modules and configurations
import { v2 } from 'cloudinary';
import app from './app.js';
import connectToDB from './configs/dbConn.js';
import { redisClient } from './app.js';

// Configure Cloudinary API
v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Establish database connection
connectToDB()
.then(() => {
    // Start the server and listen on the specified port
    app.listen(process.env.PORT || 5000, () => {
        console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    })
})
.then(() => {
    // Connect to Redis client
    redisClient.connect().then('Redis connected successfully.').catch(console.error);
})
.catch((err) => {
    // Handle MongoDB connection error
    console.log("MONGO db connection failed !!! ", err);
})