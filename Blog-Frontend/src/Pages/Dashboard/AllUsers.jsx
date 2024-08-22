import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { AllRegisteredUser, GetRegisteredUser } from "../../Redux/authSlice";
import UserCard from "../../Components/DashBoard/UserCard";
import UserSearch from "../../Components/DashBoard/UserSearch";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { data, areMore, count } = useSelector(
    (state) => state?.auth?.registeredData
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle search input changes
  function HandleSearchTerm(value) {
    if (value != "") dispatch(GetRegisteredUser({ searchTerm: value, skip: 0 }));
    else dispatch(AllRegisteredUser({ currentPage: 0 }));
    setCurrentPage(0);
    setSearchTerm((prevInput) => value);
  }

  // Handle pagination changes
  function ChangePage(page) {
    setCurrentPage(page);
    if (searchTerm != "") dispatch(GetRegisteredUser({ searchTerm, skip: currentPage }));
    else dispatch(AllRegisteredUser({ currentPage }));
  }

  // Fetch initial data on component mount
  useEffect(() => {
    dispatch(AllRegisteredUser({ currentPage: 0 }));
  }, []);

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold text-primary lg:text-3xl ">
        All the Registered Users
      </h1>
      <div className="mb-7 flex items-center flex-wrap gap-3">
        <p className="me-auto flex flex-wrap items-center gap-2 text-lg">
          <span className="font-semibold">Total Users: </span>
          <span className="rounded-full bg-primary px-4 py-1 text-white">
            {count}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2 text-lg">
          <UserSearch handleSearch={HandleSearchTerm} />
        </div>
      </div>

      <div className="min-[335px]:grid min-[335px]:grid-cols-2 justify-center flex flex-col gap-3 sm:grid-cols-3 2xl:grid-cols-4 ">
        {data && data.length != 0 && data.map((data) => <UserCard data={data} key={data._id} />)}
      </div>
      {!data.length && (
        <div className="flex flex-col items-center justify-center h-60 w-full text-2">
          <h1 className="text-2xl font-semibold text-primary lg:text-3xl ">
            No Users Found
          </h1>
        </div>
      )}

      <div className="mx-auto mb-8 mt-12 w-fit">
        <div className="join">
          <button
            className={`btn join-item ${currentPage <= 0 ? "btn-disabled" : ""}`}
            onClick={() => ChangePage(currentPage - 1)}
          >
            <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button className="btn btn-primary join-item">
            Page {currentPage + 1}
          </button>
          <button
            className={`btn join-item ${!areMore ? "btn-disabled" : ""}`}
            onClick={() => ChangePage(currentPage + 1)}
          >
            <FiChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
};

export default AllUsers;