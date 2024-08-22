import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

// A wrapper component that redirects to the homepage if the user is already logged in
const NotRequireAuth = () => {
    // Get the isLoggedIn state from the Redux store
    const { isLoggedIn } = useSelector(state => state.auth);
    
    // If the user is logged in, redirect to the homepage
    // Otherwise, render the protected route
    return isLoggedIn ? <Navigate to={"/"} replace /> : <Outlet />;
};

export default NotRequireAuth;