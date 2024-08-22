import { useState } from "react";

const UserSearch = (props) => {
  // Initialize state variables for search term and timer
  const [searchTerm, setSearchTerm] = useState("");
  const [timer, setTimer] = useState(null);

  // Handle input change event
  function handleInput(event) {
    const value = event.target.value;
    // Clear any existing timer to prevent multiple searches
    clearTimeout(timer);
    // Set a new timer to delay search by 1200ms
    const newTimer = setTimeout(() => {
      props.handleSearch(value)
    }, 1200);
    // Update timer and search term state
    setTimer(newTimer);
    setSearchTerm((prevInput) => value);
  }

  return (
    <form>
      <label className="input input-bordered flex items-center gap-2" htmlFor="searchInput">
        <input
          type="text"
          className="grow"
          placeholder="Search User"
          id="searchInput"
          value={searchTerm}
          onChange={handleInput}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4 opacity-70"
        >
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd"
          />
        </svg>
      </label>
    </form>
  );
};

export default UserSearch;