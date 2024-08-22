import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Custom hook to protect routes based on user authentication and role
const RequireAuth = ({ allowedRoles }) => {
  const { isLoggedIn, role } = useSelector(state => state.auth);
  const location = useLocation();

  // If user is logged in and has a role that matches one of the allowed roles, render the protected route
  return isLoggedIn && allowedRoles.find((myRole) => myRole == role) ? (
    <Outlet />
  ) :
  // If user is logged in but doesn't have a matching role, redirect to denied page
  isLoggedIn ? (
    <Navigate to={"/denied"} state={{ from: location }} replace />
  ) :
  // If user is not logged in, redirect to sign-in page
  (
    <Navigate to={"/sign-in"} state={{ from: location }} replace />
  );
};

export default RequireAuth;