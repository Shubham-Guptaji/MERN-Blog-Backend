import axios from "axios";

// Set up axios instance for making axios requests

const BASE_URL = "http://localhost:5000/api/v1";
// const BASE_URL = "https://alcoblog.alcodemy.tech/api/v1";

const axiosInstance = axios.create();
 
axiosInstance.defaults.baseURL = BASE_URL; 

// Allow the credentials with request
axiosInstance.defaults.withCredentials = true; 

export default axiosInstance;
 