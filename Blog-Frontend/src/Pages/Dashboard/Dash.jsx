import { useEffect } from "react";
import { FaFlag } from "react-icons/fa";
import { FaCommentDots } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { MdThumbUpAlt } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import ChartComponent from "../../Components/DashBoard/DashChart";
import { fetchChartData, SendVerifyMail } from "../../Redux/authSlice";

const Dash = () => {
  // Get dispatch function from react-redux
  const dispatch = useDispatch();
  
  // Get user data from redux store
  const { firstName, lastName, isVerified } = useSelector((state) => state?.auth?.data);
  const profile = useSelector((state) => state?.auth?.profile);
  const data = profile?.data;
  const chartstatdata = profile?.chartData;
  
  // Define an array of objects for dashboard stats
  const arr = [
    {
      title: "Followers",
      count: data.followers,
      Icon: MdGroups,
      bgColor: "bg-indigo-500",
    },
    {
      title: "Likes",
      count: data.likes,
      Icon: MdThumbUpAlt,
      bgColor: "bg-amber-400",
    },
    {
      title: "Following",
      count: data.following,
      Icon: MdGroups,
      bgColor: "bg-purple-500",
    },
    {
      title: "All Posts",
      count: data.totalPosts,
      Icon: FaFlag,
      bgColor: "bg-sky-500",
    },
    {
      title: "Comments",
      count: data.followers,
      Icon: FaCommentDots,
      bgColor: "bg-emerald-400",
    },
    {
      title: "Live Posts",
      count: data.postPublished,
      Icon: FaFlag,
      bgColor: "bg-pink-500",
    },
  ];
  
  // Function to send verification email
  function VerifyEmail() {
    dispatch(SendVerifyMail());
  }
  
  // Fetch chart data on component mount
  useEffect(() => {
    dispatch(fetchChartData());
  }, []);
  
  return (
    <>
      {/* Display warning message if email is not verified */}
      {!isVerified && (
        <div role="alert" className="alert alert-warning mb-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            Your Email Address is not yet verified. Verify to fully activate your account. 
            <button className="text-primary " onClick={VerifyEmail}>
              Click to verify
            </button>
          </span>
        </div>
      )}
      
      {/* Display user greeting */}
      <h1 className="text-center font-sans text-2xl font-semibold md:text-3xl lg:text-start">
        Hello {firstName + " " + lastName}!
      </h1>
      
      {/* Display dashboard intro text */}
      <p className="mb-7 mt-4 text-justify text-base text-indigo-600 lg:font-semibold">
        Welcome to your Blog Dashboard! Here, you can visualize your blog's
        performance. Keep an eye on your key metrics and stay informed and
        engaged with your audience.
      </p>
      
      {/* Display chart component */}
      <div className="mb-10 w-full">
        {chartstatdata?.likesData && (
          <ChartComponent
            likesData={chartstatdata?.likesData}
            followersData={chartstatdata?.followersData}
          />
        )}
      </div>
      
      {/* Display dashboard stats */}
      <div className="mt-5 flex flex-wrap justify-center gap-6 ">
        {arr.map((element) => {
          const { title, count, Icon, bgColor } = element;
          return (
            <span
              key={title}
              className={`flex items-center rounded-xl ${bgColor} w-64 p-6 shadow-md`}
            >
              <span className="flex items-center justify-center px-4">
                <Icon className="h-10 w-10 text-white" />
              </span>
              <span className="flex flex-col gap-2 px-4 py-2 text-xl font-semibold text-white lg:px-5">
                <span>{count}</span>
                <span>{title}</span>
              </span>
            </span>
          );
        })}
      </div>
    </>
  );
};
export default Dash;
