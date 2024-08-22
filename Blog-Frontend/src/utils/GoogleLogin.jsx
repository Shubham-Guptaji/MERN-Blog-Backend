import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { googleAuth } from "../Redux/authSlice";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";

// Custom button component for Google authentication
const GoogleAuthBtn = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle Google authentication response
  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        // Dispatch action to authenticate with Google
        const response = await dispatch(googleAuth({ code: authResult.code, login: props.login }));
        if (response?.payload?.success) {
          // Redirect to dashboard on successful authentication
          navigate("/dashboard");
        }
      } else {
        console.log(authResult);
        throw new Error(authResult);
      }
    } catch (e) {
      console.log(e);
      toast.error("Some Error Occured. Please try again after some time.")
    }
  };

  // Set up Google login with auth-code flow
  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <button
      className="btn my-5 mx-auto flex border border-gray-600"
      type="button"
      onClick={googleLogin}
    >
      Sign {props.login ? "in" : "up"} with Google <span><FcGoogle className="w-6 h-6" /></span>
    </button>
  );
};

export default GoogleAuthBtn;