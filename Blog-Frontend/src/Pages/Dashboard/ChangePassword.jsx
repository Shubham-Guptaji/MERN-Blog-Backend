import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import forgotImg from "../../assets/undraw_code_typing_re_p8b9.svg";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { changemyPassword } from "../../Redux/authSlice";
import toast from "react-hot-toast";

const ChangePassword = () => {
  // Get the navigate function from react-router-dom
  const navigate = useNavigate();
  // Get the dispatch function from react-redux
  const dispatch = useDispatch();
  
  // Initialize the state with empty values for old password, new password, and confirm password
  const [data, setData] = useState({
    oldPassword: "",
    password: "",
    confirmpassword: ""
  });

  // Handle form submission
  async function submitHandler(events) {
    events.preventDefault();
    
    // Validate old password
    if (data.oldPassword.length < 8) {
      toast.error("Please enter valid password");
    } 
    // Validate new password
    else if (data.password.length < 8) {
      return toast.error("Password must be at least 8 characters long.");
    } 
    // Validate password strength
    else if (!data.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]:;<>?,./\\-]).{8,}$/)) {
      return toast.error("Password should be longer than 8 alphanumberic small and capital characters with special characters.");
    } 
    // Validate confirm password
    else if (data.password != data.confirmpassword) {
      return toast.error("Passwords and Confirm Password do not match.");
    } 
    
    // Dispatch the change password action
    let res = await dispatch(changemyPassword({ oldPassword: data.oldPassword, newPassword: data.password }));
    
    // If the password change is successful, reset the form and navigate back to the previous page
    if (res?.payload?.success) {
      setData({
        oldPassword: "",
        password: "",
        confirmpassword: ""
      });
      navigate(-1);
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
              Change Your Password
            </h1>
            <p className="mb-4 mt-2 text-center text-slate-500">
              Password should be longer than 8 alphanumberic characters with special characters.
            </p>
            <label className="form-control w-full max-w-md" htmlFor="oldPassword">
              <div className="label">
                <span className="label-text">Old Password</span>
              </div>
              <input
                type="text"
                placeholder="Enter Your Current Password"
                name="oldPassword"
                className="input input-bordered w-full max-w-md ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
                onChange={(event) => setData({...data, [event.target.name]: event.target.value})}
                  value={data.oldPassword}
              />
            </label>
            <label className="form-control w-full max-w-md" htmlFor="password">
              <div className="label">
                <span className="label-text">New Password</span>
              </div>
              <input
                type="text"
                placeholder="Enter Password"
                name="password"
                className="input input-bordered w-full max-w-md ring-1 ring-indigo-500 focus:ring-2 focus:ring-indigo-600"
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
                to={"/dashboard"}
                className="flex cursor-pointer items-center justify-center gap-1 text-indigo-500"
              >
                <IoChevronBackOutline /> <span>Back to Dashboard</span>
              </Link>
            </p>
          </form>
        </div>
      </div>
        </Layout>
    )
}
export default ChangePassword;