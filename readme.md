# Blog Website Backend

## Introduction
This repository contains the backend code for a full-fledged blog website. It provides various features including JWT authentication, CRUD operations for posts and comments, user management functionalities like following/unfollowing authors, admin privileges to block/unblock users, and file management for uploading and deleting files.

## Features
- **JWT Authentication:** Users can authenticate using JSON Web Tokens for secure access to the website.
- **Post Management:**
  - Create, read, update, and delete posts.
  - Like posts to show appreciation.
- **Comment Management:**
  - Create, read, update, and delete comments on posts.
- **User Management:**
  - Follow/unfollow authors to customize the feed.
  - Admin privileges to block/unblock users.
- **File Management:**
  - Upload files such as images for posts.
  - Delete uploaded files when necessary.

## Technologies Used
- **Backend Framework:** Express JS
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Other Technologies:** Cloudinary, Mongoose, Bcrypt, Express-Rate-Limit, Multer

## Setup Instructions
1. **Clone the Repository:**
```
  git clone https://github.com/Shubham-Guptaji/MERN-Blog-Backend.git
```

2. **Install Dependencies:**
```
  cd MERN-Blog-Backend
  npm install
```

3. **Environment Variables:**
- Create a `.env` file based on the `.env.example` file.
- Populate the environment variables with appropriate values.

4. **Database Setup:**
- Set up your database and update the database configuration in the `.env` file.

5. **Run the Server:**
```
  npm start
```


6. **Testing:**
- Use tools like Postman or write unit tests to ensure the APIs work as expected.

## Api Documentation
- User Apis Documentation : https://documenter.getpostman.com/view/31843425/2sA2xjyAih
- Blog Apis Documentation : https://documenter.getpostman.com/view/31843425/2sA2xk1BXv
- Resource File Apis Documentation : https://documenter.getpostman.com/view/31843425/2sA2xk1BcF
- Miscellaneous and Social Apis Documentation : https://documenter.getpostman.com/view/31843425/2sA2xk1BcE
- Comment Apis Documentation : https://documenter.getpostman.com/view/31843425/2sA2xk1BcC

## Ownership
- Shubham Gupta

## License
MIT License

