// Import necessary dependencies
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

// Import custom components
import Layout from "../Layout/Layout";
import { loginAccount } from "../Redux/authSlice";
import GoogleAuthBtn from "../utils/GoogleLogin";

// Define the SignIn component
const SignIn = () => {
  // Get the dispatch function from react-redux
  const dispatch = useDispatch();
  
  // Get the navigate function from react-router-dom
  const navigate = useNavigate();
  
  // Initialize the logindata state with empty username and password
  const [logindata, setlogindata] = useState({
    username: "",
    password: "",
  });

  // Define a function to handle changes to the input fields
  const changeHandler = (event) => {
    // Get the name and value of the input field
    const { name, value } = event.target;

    // Update the logindata state based on the input field name
    setlogindata({
      ...logindata,
      [name]: value, // Dynamically update the state key based on the input name
    });
  };

  // Define a function to handle the form submission
  const submitHandler = async (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Check if both username and password are filled
    if (!logindata.username || !logindata.password) {
      // Show an error toast if not
      toast.error("Please fill all the fields.");
      return;
    }

    // Dispatch the loginAccount action with the logindata
    const res = await dispatch(loginAccount(logindata));

    // Check if the login was successful
    if (res?.payload?.success) {
      // Navigate to the home page if successful
      navigate("/");

      // Clear the login inputs
      setlogindata({
        username: "",
        password: "",
      });
    }
  };

  // Return the JSX for the SignIn component
  return (
    <Layout>
      <div className="bg-slate-200">
        <div className="mx-auto my-12 xl:my-16 2xl:my-20 xl:min-h-[80vh] flex max-w-lg flex-col items-start justify-center">
          <h1 className="my-4 text-center text-3xl font-bold text-indigo-600 sm:text-4xl md:text-5xl mx-auto">
            Welcome to Alcodemy Blog
          </h1>
          <p className="mx-auto mb-5 text-center text-xl">
            Log In to access and manage your account.
          </p>
          <form
            onSubmit={submitHandler}
            className="mx-auto flex flex-col gap-y-6 bg-white px-4 sm:px-8 lg:px-12 py-12 mt-3 shadow rounded-lg"
          >
            <label className="form-control w-full max-w-md" htmlFor="username">
              <div className="label">
                <span className="label-text">Username</span>
              </div>
              <input
                type="text"
                placeholder="Your username"
                name="username"
                className="input input-bordered w-full max-w-md ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
                onChange={changeHandler}
                value={logindata.username}
              />
            </label>

            <label className="form-control w-full max-w-md" htmlFor="password">
              <div className="label">
                <span className="label-text">Password</span>
              </div>
              <input
                type="password"
                placeholder="Your password"
                name="password"
                className="input input-bordered w-full max-w-md ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
                onChange={changeHandler}
                value={logindata.password}
              />
            </label>

            <div className="w-full max-w-xs">
              <button type="submit" className="btn btn-primary mx-auto flex mt-2">
                Sign In
              </button>
              <GoogleAuthBtn login={true} />
            </div>
            <div>
              <p className="mt-3 max-w-xs">
                Don't have an account?&nbsp;{" "}
                <Link to={"/sign-up"} className="cursor-pointer text-indigo-500">
                  Create Account
                </Link>
              </p>
              <Link to="/forgot-password" className="cursor-pointer text-indigo-600 block text-center">
                Forgot Password
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
