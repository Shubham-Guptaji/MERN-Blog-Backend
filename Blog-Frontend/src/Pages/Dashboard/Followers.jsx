import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import FollowerCard from "../../Components/DashBoard/FollowerCard";
import { myFollowers } from "../../Redux/Miscellaneous";

const Followers = () => {
  // Get the dispatch function from Redux
  const dispatch = useDispatch();
  
  // State to keep track of the current page
  const [currentPage, setCurrentPage] = useState(0);
  
  // Selectors to get the followers and whether there are more followers from the Redux state
  const areMore = useSelector((state) => state?.misc?.followers?.areMoreFollowers);
  const Followers = useSelector((state) => state?.misc?.followers?.followers);
  
  // Fetch followers when the component mounts or when the current page changes
  useEffect(() => {
    dispatch(myFollowers({ skip: currentPage * 20 }));
  }, [currentPage]);
  
  return (
    <>
      <h1 className="text-2xl lg:text-3xl font-semibold text-primary mb-10">All Your Followers</h1>
      
      {/* Display followers in a grid */}
      <div className="grid justify-center gap-3 grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 ">
        {Followers && Followers.length != 0 && Followers.map((data) => {
          return <FollowerCard key={data._id} data={data} />;
        })}
      </div>
      
      {/* Display a message if there are no followers */}
      {(!Followers || Followers.length == 0) && (
        <div className="flex flex-col items-center justify-center h-60 w-full text-2xl">
          <h1 className="text-2xl font-semibold text-primary lg:text-3xl ">
            You don't have any Follower yet.
          </h1>
        </div>
      )}
      
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

export default Followers;