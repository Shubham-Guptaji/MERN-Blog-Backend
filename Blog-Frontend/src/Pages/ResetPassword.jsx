import { useState } from "react";
import toast from "react-hot-toast";
import { IoChevronBackOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

import forgotImg from "../assets/undraw_code_typing_re_p8b9.svg";
import axiosInstance from "../Helper/axiosInstance";
import Layout from "../Layout/Layout";

/**
 * Reset Password component
 * Handles password reset functionality
 */
const ResetPassword = () => {
  // Get token from URL params
  const token = useParams().token;
  // Check if user is logged in
  const isLoggedIn = useSelector(state => state?.auth?.isLoggedIn);
  // Navigate to different routes
  const navigate = useNavigate();
  // State to store password and confirm password
  const [data, setData] = useState({
    password: "",
    confirmpassword: ""
  })

  /**
   * Submit handler for password reset form
   * @param {Event} events - Form submit event
   */
  const submitHandler = async (events) => {
    events.preventDefault();
    // Check password length
    if(data.password.length < 8 ) {
      return toast.error("Password must be at least 8 characters long.");
    } 
    // Check password format
    else if (!data.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]:;<>?,./\\-]).{8,}$/)){
      return toast.error("Password should be longer than 8 alphanumberic small and capital characters with special characters.")
    }
    // Check if password and confirm password match
    else if(data.password != data.confirmpassword) {
      return toast.error("Passwords and Confirm Password do not match.");
    } 
    try {
      // Make API call to reset password
      let res = axiosInstance.post(`/user/reset/${token}`, data);
      // Show toast message based on API response
      toast.promise(res, {
        loading: "Loading...",
        success: (data) => {
          return data?.data?.message;
        },
        error: "Failed to change the password.",
      });
      res = await res;
      // If password reset is successful, clear form data and navigate to login page if not logged in
      if(res?.data?.success) {
        setData({
          password: "",
          confirmpassword: ""
        })
        if(!isLoggedIn) navigate("/sign-in")
      }
    } catch (error) {
      // Show error message if API call fails
      toast.error(error?.response?.data?.message);
    }
  }

  return (
    <Layout>
      <div className="bg-slate-200">
        <div className="mx-auto my-12 flex max-w-lg flex-col items-start justify-center xl:my-16 xl:min-h-[80vh] 2xl:my-20 ">
          <form
              onSubmit={submitHandler}
            className="mx-auto mt-3 flex max-w-md flex-col rounded-lg bg-white px-4 py-12 shadow sm:px-8 lg:px-12"
          >
            <img src={forgotImg} alt="" className="mx-auto my-3 sm:w-10/12" />

            <h1 className="mt-5 text-center text-xl font-bold">
              Reset Password
            </h1>
            <p className="mb-4 mt-2 text-center text-slate-500">
              Password should be longer than 8 alphanumberic characters with special characters.
            </p>
            <label className="form-control w-full max-w-md" htmlFor="password">
              <div className="label">
                <span className="label-text">New Password</span>
              </div>
              <input
                type="text"
                placeholder="Enter Password"
                name="password"
                className="input input-bordered w-full max-w-md ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
                //   onChange={changeHandler}
                onChange={(event) => setData({...data, [event.target.name]: event.target.value})}
                  value={data.password}
              />
            </label>
            <label className="form-control w-full max-w-md mt-2" htmlFor="confirmpassword">
              <div className="label">
                <span className="label-text">Confirm Password</span>
              </div>
              <input
                type="text"
                placeholder="Enter Confirm Password"
                name="confirmpassword"
                className="input input-bordered w-full max-w-md ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
                //   onChange={changeHandler}
                onChange={(event) => setData({...data, [event.target.name]: event.target.value})}
                  value={data.confirmpassword}
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary mt-7 bg-indigo-600 text-lg text-white"
            >
              Submit
            </button>
            <p className="mt-5 max-w-xs text-center">
              <Link
                to={"/sign-in"}
                className="flex cursor-pointer items-center justify-center gap-1 text-indigo-500"
              >
                <IoChevronBackOutline /> <span>Back to Login</span>
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
