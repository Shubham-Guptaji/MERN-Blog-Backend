import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { updateToken } from "../Redux/authSlice";

const ACCESS_TOKEN_EXPIRES_TIME = 1000 * 60 * 10; // 10 minutes

const AuthToken = ({ children }) => {
  const accessToken = useSelector((state) => state?.auth?.token?.accessToken) || null;
  const refreshToken = useSelector((state) => state?.auth?.token?.refreshToken) || null;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isFirstMounted, setIsFirstMounted] = useState(true);

  // Function to update token and handle errors
  async function updateTokenfn() {
    const res = await dispatch(updateToken());
    if (!res?.payload?.success) {
      navigate('/sign-in');
    }
    if (isFirstMounted) setIsFirstMounted(false);
  }

  useEffect(() => {
    if (refreshToken) {
      // Update token on first mount and set interval for subsequent updates
      if (isFirstMounted) updateTokenfn();
      const intervalId = setInterval(() => updateTokenfn(), ACCESS_TOKEN_EXPIRES_TIME);
      return () => clearInterval(intervalId);
    }
    return undefined;
  }, []);

  return (
    <>
      {children}
    </>
  );
};

export default AuthToken;