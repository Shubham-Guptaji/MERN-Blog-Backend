import { useNavigate } from "react-router-dom";

const UserCard = ({ data }) => {
  const navigate = useNavigate();

  // Format the created date to a readable format
  const date = new Date(data.createdAt);
  const newDate = date.toLocaleDateString("en-GB");

  return (
    <div className="mb-6 flex flex-shrink flex-col items-center justify-center space-x-3 ">
      {/* User avatar and username link */}
      <div
        className="h-24 w-32 cursor-pointer overflow-hidden rounded-2xl bg-gray-200 shadow shadow-gray-500 sm:h-28 sm:w-36 xl:h-32 xl:w-44"
        onClick={() => navigate(`/username/${data.username}`)}
      >
        <img
          src={data.avatar.secure_url}
          alt={data.username}
          className="transform duration-300 hover:scale-125 "
        />
      </div>

      {/* Username link */}
      <div
        className="mt-2 cursor-pointer text-center text-wrap w-full text-lg font-medium text-primary hover:text-indigo-800"
        onClick={() => navigate(`/username/${data.username}`)}
      >
        {data.firstName + " " + data.lastName}
      </div>

      {/* Created date and role information */}
      <div className=" text-center italic text-gray-500">
        Created : {newDate}
      </div>
      <div className="text-center italic text-gray-500">
        <strong>Role : </strong><span className="text-primary uppercase">{data.role}</span>
      </div>
    </div>
  );
};

export default UserCard;