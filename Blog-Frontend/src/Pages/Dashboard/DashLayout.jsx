import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaFileAlt, FaUserEdit } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { HiUserGroup } from "react-icons/hi2";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { PiUsersFourFill } from "react-icons/pi";
import { Link } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { fetchDash } from "../../Redux/authSlice";
import AllPost from "./AllPost";
import Dash from "./Dash";
import Followers from "./Followers";
import Following from "./Following";
import Profile from "./Profile";
import DeleteAccount from "./DeleteAccount";
import EditProfile from "./EditProfile";
import AllUsers from "./AllUsers";

// Dashboard layout component
const DashLayout = () => {
  // Get user data from Redux store
  const { username, isVerified, role } = useSelector((state) => state?.auth?.data);
  const [currentPage, setCurrentPage] = useState(1);
  const [subNavState, setSubNavState] = useState(true);
  const dispatch = useDispatch();

  // Function to hide the drawer
  const hideDrawer = () => {
    const element = document.getElementsByClassName("drawer-toggle");
    element[0].checked = false;

    // collapsing the drawer-side width to zero
    const drawerSide = document.getElementsByClassName("drawer-side");
    drawerSide[0].style.width = 0;
    setSubNavState(false);
  };

  // Function to change the drawer width on menu button click
  const changeWidth = () => {
    const drawerSide = document.getElementsByClassName("drawer-side");
    drawerSide[0].style.width = "auto";
    setSubNavState(true);
  };

  // Array of components to render based on current page
  const arr = [0, Dash, AllUsers, AllPost, Followers, Following, Profile, DeleteAccount, EditProfile];

  // Function to change the current page
  function ChangePage(pageNo) {
    setCurrentPage(pageNo);
  }

  // Get the current component to render
  const ComponentData = arr[currentPage];

  // Fetch dashboard data on mount
  useEffect(() => {
    dispatch(fetchDash({ username }));
  }, [])

  return (
    <Layout>
      <div className="container mx-auto lg:mt-3 mb-3 px-3 md:w-10/12">
        <div className=" mb-8 lg:flex flex-col gap-3 lg:my-5 sm:flex-row">
          {/* Mobile navigation drawer */}
          <div className={`drawer ${subNavState ? "z-30" : "z-10" } md:z-30 bg-primary lg:hidden sticky top-12 md:top-[60px]`}>
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content me-auto bg-primary block z-0 px-3 py-1 ">
              <label htmlFor="my-drawer" className="flex items-center gap-2 relative cursor-pointer">
                <FiMenu
                  onClick={changeWidth}
                  size={"28px"}
                  className="font-bold text-white "
                /> <span className="text-white text-lg">Menu</span>
              </label>
            </div>
            <div className="drawer-side">
              <label
                htmlFor="my-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>

              <ul className="menu min-h-full w-72 bg-gray-100 p-4 text-base-content">
                <li className="absolute right-2 w-fit cursor-pointer">
                  <button onClick={hideDrawer}>
                    <AiFillCloseCircle
                      size={24}
                      className=" cursor-pointer text-primary"
                    />
                  </button>
                </li>
                <span className="mt-12"></span>

                {/* Navigation links */}

                  
                  <li>
                    <Link
                      to="/dashboard"
                      className=" text-base font-semibold text-indigo-600"
                      onClick={() => setCurrentPage(1)}
                    >
                      <IoHomeOutline className="h-6 w-6" /> Dashboard
                    </Link>
                  </li>
                  { role == "admin" &&
                      (
                        <li>
                      <Link
                        to="/dashboard"
                        className="text-base font-semibold"
                        onClick={() => setCurrentPage(2)}
                      >
                        <PiUsersFourFill className="h-6 w-6" /> All Users
                      </Link>
                    </li>
                      )
                    }
                  <li>
                    <Link to="/create" className="text-base font-semibold">
                      <FaUserEdit className="h-6 w-6" /> Create New Post
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard"
                      className="text-base font-semibold"
                      onClick={() => setCurrentPage(3)}
                    >
                      <FaFileAlt className="h-6 w-6" /> My Posts
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard"
                      className="text-base font-semibold"
                      onClick={() => setCurrentPage(4)}
                    >
                      <HiUserGroup className="h-6 w-6" /> My Followers
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard"
                      className="text-base font-semibold"
                      onClick={() => setCurrentPage(5)}
                    >
                      <HiUserGroup className="h-6 w-6" /> My Followings
                    </Link>
                  </li>
                  <li className="mt-auto">
                    <Link
                      to="/dashboard"
                      className="text-base font-semibold"
                      onClick={() => setCurrentPage(6)}
                    >
                      <MdOutlineSettings className="h-6 w-6" /> Profile
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          <div className="flex w-full flex-row-reverse flex-nowrap sm:flex-row lg:justify-between">
          
            <div className="flex min-h-[80dvh] w-full">
              <div className="drawer w-0 lg:drawer-open lg:w-72">
                <input
                  id="my-drawer-2"
                  type="checkbox"
                  className="drawer-toggle"
                />
                <div className="drawer-content flex flex-col ">
                  {/* Page content here */}
                  {/* <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden"><FiMenu size={"32px"}
                    className="font-bold text-green-400"/></label> */}
                </div>
                <div className="drawer-side h-full lg:flex hidden">
                  <label
                    htmlFor="my-drawer-2"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                  ></label>

                  {/* <ul className="menu min-h-full w-72 bg-base-200 p-4 text-base-content"> */}
                  <ul className="menu  min-h-full w-72 bg-blue-600  p-4 text-gray-200 lg:rounded-sm lg:text-lg ">
                    {/* Sidebar content here */}
                    <li>
                      <Link
                        to="/dashboard"
                        className=" font-semibold text-orange-300"
                        onClick={() => setCurrentPage(1)}
                      >
                        <IoHomeOutline className="h-6 w-6" /> Dashboard
                      </Link>
                    </li>
                    { role == "admin" &&
                      (
                        <li>
                      <Link
                        to="/dashboard"
                        className=" font-semibold"
                        onClick={() => setCurrentPage(2)}
                      >
                        <PiUsersFourFill className="h-6 w-6" /> All Users
                      </Link>
                    </li>
                      )
                    }
                    <li>
                      {isVerified ? (<Link to="/create" className=" font-semibold">
                        <FaUserEdit className="h-6 w-6" /> Create New Post
                      </Link>) : (<button className=" font-semibold" onClick={() => toast.error("Verify your account to create the post")}><FaUserEdit className="h-6 w-6" /> Create New Post</button>)}
                    </li>
                    <li>
                      <Link
                        to="/dashboard"
                        className=" font-semibold"
                        onClick={() => setCurrentPage(3)}
                      >
                        <FaFileAlt className="h-6 w-6" /> My Posts
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard"
                        className=" font-semibold"
                        onClick={() => setCurrentPage(4)}
                      >
                        <HiUserGroup className="h-6 w-6" /> My Followers
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard"
                        className=" font-semibold"
                        onClick={() => setCurrentPage(5)}
                      >
                        <HiUserGroup className="h-6 w-6" /> My Followings
                      </Link>
                    </li>
                    <li className="mt-auto">
                      <Link
                        to="/dashboard"
                        className=" font-semibold"
                        onClick={() => setCurrentPage(6)}
                      >
                        <MdOutlineSettings className="h-6 w-6" /> Profile
                      </Link>
                    </li>
                  </ul>

                </div>
              </div>
              <div className="divider divider-horizontal hidden xl:flex"></div>
              <div className="container mx-auto h-full w-full px-4 pt-4 pb-6 lg:py-6 ">
                <ComponentData changePage={ChangePage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashLayout;
