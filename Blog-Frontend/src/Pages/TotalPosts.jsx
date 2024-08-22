import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiFillCloseCircle } from "react-icons/ai";
import { FiChevronLeft, FiChevronRight, FiMenu } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import TrendingCards from "../Components/Home/Trending-Cards";
import Layout from "../Layout/Layout";
import { allblogposts, searchTag } from "../Redux/blogSlice";

// Component to display all blog posts
const TotalPosts = () => {
  const dispatch = useDispatch();
  let { state } = useLocation();
  const [tag, setTag] = useState(state ? state.tag : null);
  // Get all posts, areMore flag, and keywords from Redux store
  const { allPosts, areMore, keywords } = useSelector((state) => state.blog);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [timer, setTimer] = useState(null);

  // Handle input change in search field
  const handleInput = (event) => {
    const value = event?.target?.value;
    // Clear the existing timer
    clearTimeout(timer);
    // Set a new timer for 1 second
    const newTimer = setTimeout(() => {
      if (value != "") dispatch(searchTag({ tag: value }));
      else {
        setTag(null);
        setCurrentPage(0);
        dispatch(allblogposts(currentPage * 20));
      }
    }, 1200);

    setTimer(newTimer);
    setSearchInput((prevInput) => value);
  };

  // Handle search form submission
  const handleSearch = (event) => {
    event.preventDefault();
    if (searchInput == "") {
      // toast.error("Search keyword is required...");
      setTag(null);
      setCurrentPage(0);
      dispatch(allblogposts(currentPage * 20));
      return;
    }
    dispatch(searchTag({tag: searchInput}));
  };

  // Hide the drawer when the close button is clicked
  const hideDrawer = () => {
    const element = document.getElementsByClassName("drawer-toggle");
    element[0].checked = false;

    // collapsing the drawer-side width to zero
    const drawerSide = document.getElementsByClassName("drawer-side");
    drawerSide[0].style.width = 0;
  };

  // Change the drawer width when the menu button is clicked
  const changeWidth = () => {
    const drawerSide = document.getElementsByClassName("drawer-side");
    drawerSide[0].style.width = "auto";
  };

  // Fetch posts when the component mounts or when the tag or current page changes
  useEffect(() => {
    if (tag != null) {
      dispatch(searchTag({ tag: tag, skip: currentPage * 20 }));
    } else dispatch(allblogposts(currentPage * 20));
    window.scrollTo(0, 0);
  }, [currentPage, tag]);
  
  return (
    <Layout>
      <div className="container mx-auto my-3 px-3 md:w-10/12">
        <div className="my-2 mb-8 flex flex-col items-center justify-between gap-3 sm:my-5 sm:flex-row">
          <div className="flex w-full flex-row-reverse flex-nowrap items-center justify-between sm:flex-row">
            <span className="text-nowrap pe-2 text-3xl font-bold text-indigo-600 sm:pe-0 md:text-4xl">
              Posts Hub
            </span>
            <div className="drawer z-30 sm:hidden ">
              <input id="my-drawer" type="checkbox" className="drawer-toggle" />
              <div className="drawer-content me-auto">
                <label htmlFor="my-drawer" className="relative cursor-pointer ">
                  <FiMenu
                    onClick={changeWidth}
                    size={"32px"}
                    className="m-4 font-bold text-indigo-600"
                  />
                </label>
              </div>
              <div className="drawer-side">
                <label
                  htmlFor="my-drawer"
                  aria-label="close sidebar"
                  className="drawer-overlay"
                ></label>
                <ul className="menu min-h-full w-72 bg-indigo-500 p-4 text-base-content">
                  <li className="absolute right-2 w-fit cursor-pointer">
                    <button onClick={hideDrawer}>
                      <AiFillCloseCircle
                        size={24}
                        className=" cursor-pointer text-white"
                      />
                    </button>
                  </li>
                  <span className="mt-12"></span>

                  {keywords.length != 0 &&
                    keywords.map((element) => {
                      return (
                        <li
                          key={element}
                          onClick={() => {
                            setTag(element);
                            setCurrentPage(0);
                            hideDrawer();
                          }}
                          className="text-clip text-base text-white"
                        >
                          {element}
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          </div>

          <form className="w-fit max-w-full px-3" onSubmit={handleSearch}>
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="text"
                className="me-auto w-[18rem] max-w-xs shrink grow sm:w-[23rem]"
                placeholder="Search"
                value={searchInput}
                onChange={handleInput}
              />
              <button type="submit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-5 w-5 cursor-pointer text-indigo-600 opacity-70"
                  type="submit"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </label>
          </form>
        </div>

        <div className="divider mt-8 shadow-sm"></div>
        <div className="mx-auto mt-8 hidden w-full flex-wrap justify-center gap-3 px-2 sm:flex">
          {keywords.length != 0 &&
            keywords.map((element) => {
              return (
                <button
                  key={element}
                  className="rounded-full p-2 pb-1 pt-1 text-center text-indigo-600 ring-2 sm:p-3 sm:pb-2 sm:pt-2"
                  onClick={() => {
                    setTag(element);
                    setCurrentPage(0);
                  }}
                >
                  {element}
                </button>
              );
            })}
        </div>

        
          {allPosts.length != 0 ? (
            <div className="mt-14 grid justify-center gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allPosts.map((element) => (
              <TrendingCards element={element} key={element._id} />
            ))}
            </div>
          ) : (
            <div className="text-2 flex h-60 w-full flex-col items-center justify-center">
              <h1 className="text-2xl font-semibold text-primary lg:text-3xl ">
                There are no posts available right now
              </h1>
            </div>
          )}

        <div className="mx-auto mb-8 mt-12 w-fit">
          <div className="join">
            <button
              className={`btn join-item ${currentPage <= 0 ? "btn-disabled" : ""}`}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button className="btn btn-primary join-item">
              Page {currentPage + 1}
            </button>
            <button
              className={`btn join-item ${!areMore ? "btn-disabled" : ""}`}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <FiChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default TotalPosts;
