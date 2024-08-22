import { useState } from "react";
import toast from "react-hot-toast";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import SignUpImg from "../assets/sign-up.svg";
import Layout from "../Layout/Layout";
import { createAccount } from "../Redux/authSlice";
import GoogleAuthBtn from "../utils/GoogleLogin";

// SignUp component
const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Initialize signupData state with empty fields
  const [signupData, setSignupData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    avatar: "",
  });

  // Initialize previewImage state to store the uploaded image URL
  const [previewImage, setImagePreview] = useState("");

  // Handle form data changes
  const changeHandler = (e) => {
    const { name, value } = e.target;

    // Update the signupData state based on the input field name
    setSignupData({
      ...signupData,
      [name]: value, // Dynamically update the state key based on the input name
    });
  };

  // Handle image upload
  const getImage = (event) => {
    event.preventDefault();
    // Get the uploaded image
    const uploadedImage = event.target.files[0];

    // If image exists, update the signupData state and previewImage state
    if (uploadedImage) {
      setSignupData({
        ...signupData,
        avatar: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setImagePreview(this.result);
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for empty fields
    if (
      !signupData.avatar ||
      !signupData.email ||
      !signupData.username ||
      !signupData.firstname ||
      !signupData.lastname ||
      !signupData.password
    ) {
      toast.error("Please fill all the fields including Image");
      return;
    }

    // Check username length
    if (signupData.username.length < 5) {
      toast.error("Username should be atleast of 5 characters");
      return;
    }

    // Check full name length
    if ((signupData.firstname + " " + signupData.lastname).length < 5) {
      toast.error("Firstname and Lastname should be atleast of 5 characters together");
      return;
    }

    // Check email validity
    if (!signupData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      toast.error("Invalid Email Id");
      return;
    }

    // Check password validity using regex
    if (!signupData.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)) {
      toast.error("Minimum password length should be 8 with Uppercase, Lowercase, Number and Symbol");
      return;
    }

    // Create a new FormData object
    const formdata = new FormData();
    formdata.append("username", signupData.username);
    formdata.append("firstName", signupData.firstname);
    formdata.append("lastName", signupData.lastname);
    formdata.append("email", signupData.email);
    formdata.append("password", signupData.password);
    formdata.append("avatar", signupData.avatar);

    // Call createAccount action
    const res = await dispatch(createAccount(formdata));

    // Redirect to dashboard if account creation is successful
    if (res?.payload?.success) {
      // Clear the signup inputs
      setSignupData({
        username: "",
        email: "",
        firstname: "",
        lastname: "",
        password: "",
        avatar: "",
      });
      setImagePreview("");

      navigate("/dashboard");
    }
  };

  return (
    <Layout>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content my-14 flex-col rounded-md border-2 bg-white p-10 shadow-md lg:flex-row">
          <div className="mx-auto max-w-xs lg:w-6/12 lg:max-w-full">
            <img
              src={SignUpImg}
              alt="Sign Up Alcodemy Blog"
              className="h-full w-full overflow-hidden rounded-md"
            />
          </div>
          <div className="mx-auto mt-8 w-full lg:w-6/12">
            <form
              className="mx-auto max-w-xs lg:w-full lg:max-w-full lg:pl-7"
              onSubmit={handleSubmit}
            >
              <h1 className="mb-6 max-w-xs text-center text-3xl text-indigo-600 lg:text-4xl">
                Register with Us
              </h1>

              <div className=" mb-4 w-full max-w-xs">
                <label className="cursor-pointer" htmlFor="image_uploads">
                  {previewImage ? (
                    <img
                      className="m-auto h-32 w-32 rounded-full ring-2 ring-indigo-600"
                      src={previewImage}
                      alt="preview image"
                    />
                  ) : (
                    <BsPersonCircle className="m-auto h-32 w-32 rounded-full border-2 bg-slate-200 p-2 text-indigo-600 " />
                  )}
                </label>
                <input
                  onChange={getImage}
                  className="hidden"
                  type="file"
                  id="image_uploads"
                  name="image_uploads"
                  accept=".jpg, .jpeg, .png"
                />
              </div>

              <label
                className="form-control w-full max-w-xs"
                htmlFor="username"
              >
                <div className="label">
                  <span className="label-text ">Username</span>
                </div>
                <input
                  type="text"
                  placeholder="Your Username"
                  name="username"
                  className="input input-bordered w-full max-w-xs ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
                  onChange={changeHandler}
                  value={signupData.username}
                />
              </label>

              <label
                className="form-control w-full max-w-xs"
                htmlFor="firstName"
              >
                <div className="label">
                  <span className="label-text">First Name</span>
                </div>
                <input
                  type="text"
                  placeholder="Your firstname"
                  name="firstname"
                  className="input input-bordered w-full max-w-xs ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
                  onChange={changeHandler}
                  value={signupData.firstname}
                />
              </label>

              <label
                className="form-control w-full max-w-xs"
                htmlFor="lastName"
              >
                <div className="label">
                  <span className="label-text">Last Name</span>
                </div>
                <input
                  type="text"
                  placeholder="Your lastname"
                  name="lastname"
                  className="input input-bordered w-full max-w-xs ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
                  onChange={changeHandler}
                  value={signupData.lastname}
                />
              </label>

              <label className="form-control w-full max-w-xs" htmlFor="email">
                <div className="label">
                  <span className="label-text">Email</span>
                </div>
                <input
                  type="email"
                  placeholder="Your email"
                  name="email"
                  className="input input-bordered w-full max-w-xs ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
                  onChange={changeHandler}
                  value={signupData.email}
                />
              </label>

              <label
                className="form-control w-full max-w-xs"
                htmlFor="password"
              >
                <div className="label">
                  <span className="label-text">Password</span>
                </div>
                <input
                  type="text"
                  placeholder="Your Password"
                  name="password"
                  className="input input-bordered w-full max-w-xs ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
                  onChange={changeHandler}
                  value={signupData.password}
                />
              </label>
              <div className="w-full max-w-xs">
              <button type="submit" className="btn btn-primary mx-auto flex mt-7">
                Create
              </button>
              <GoogleAuthBtn login={false} />
              </div>
              <p className="mt-3 max-w-xs">
                Already have an account ?&nbsp;{" "}
                <Link to={"/sign-in"} className="cursor-pointer text-indigo-500">
                  Login to Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
