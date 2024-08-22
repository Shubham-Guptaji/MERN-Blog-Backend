import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import FollowerCard from "../../Components/DashBoard/FollowerCard";
import { meFollowing } from "../../Redux/Miscellaneous";

const Following = () => {
  // Get the dispatch function from Redux
  const dispatch = useDispatch();
  
  // State to keep track of the current page
  const [currentPage, setCurrentPage] = useState(0);
  
  // Check if there are more followers to load
  const areMore = useSelector(
    (state) => state?.misc?.followers?.meFollow
  );
  
  // Get the list of followed authors from Redux state
  const Followers = useSelector((state) => state?.misc?.meFollow?.authors);
  
  // Fetch the next page of followers when the current page changes
  useEffect(() => {
    dispatch(meFollowing({ skip: currentPage * 20 }));
  }, [currentPage]);
  
  return (
    <>
      <h1 className="text-2xl lg:text-3xl font-semibold text-primary mb-10">All the Followed Authors</h1>
      
      {/* Display a grid of follower cards */}
      <div className="grid justify-center gap-3 grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 ">
        {Followers && Followers.length != 0 && Followers.map((data) => {
          return <FollowerCard key={data._id} data={data} />;
        })}
      </div>
      
      {/* Display a message if there are no followers */}
      {(!Followers || Followers.length == 0) && 
        (
          <div className="flex flex-col items-center justify-center h-60 w-full ">
            <h1 className="text-2xl font-semibold text-primary lg:text-3xl ">
              You are not following anyone yet.
            </h1>
          </div>
        )
      }
      
      {/* Pagination controls */}
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
    </>
  );
};

export default Following;