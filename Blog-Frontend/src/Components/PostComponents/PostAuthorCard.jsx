import { useDispatch, useSelector } from "react-redux";
import { Follow, UnFollow } from "../../Redux/Miscellaneous";
import { Link } from "react-router-dom";

// Component to display post author's card
const PostAuthorCard = ({ postDetails }) => {
  const dispatch = useDispatch();
  const followId = useSelector((state) => state?.misc?.followId);
  const userId = useSelector((state) => state?.auth?.data?.id);
  const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
  const isFollowing = useSelector((state) => state?.misc?.isFollowing);
  const isVerified = useSelector((state) => state?.auth?.data?.isVerified);

  // Handle follow button click
  const followHandler = async () => {
    if (!isLoggedIn) return toast.error("Login to follow..");
    if (!isVerified) return toast.error("Your account isn't verified yet");
    dispatch(
      Follow({ authId: postDetails?.author?._id, blogId: postDetails?._id })
    );
  };

  // Handle unfollow button click
  const unfollowHandler = async () => {
    if (!isLoggedIn || !followId)
      return toast.error("You should be loggedin with followId.");
    dispatch(UnFollow({ FollowId: followId }));
  };

  return (
    <div className="mt-16 flex flex-col justify-between rounded bg-gray-100 p-2 sm:flex-row sm:p-4">
      <div className="sm:max-w-md">
        <Link to={`/username/${postDetails?.author?.username}`}>
          <img
            src={postDetails?.author?.avatar?.secure_url}
            alt={postDetails?.author?.username}
            className="h-20 w-20 rounded-full border-2  bg-gray-500"
          />
        </Link>
        <Link to={`/username/${postDetails?.author?.username}`}>
          <h2 className="my-2 text-xl font-semibold sm:text-2xl">
            Post Author{" "}
            {postDetails?.author?.firstName + " " + postDetails?.author?.lastName}
          </h2>
        </Link>
        <span className="font-semibold">
          {postDetails?.author?.followers}{" "}
          {postDetails?.author?.followers > 1 ? "Followers" : "Follower"}
        </span>
        <p className="mt-3 text-justify">{postDetails?.author?.bio}</p>
      </div>
      <div className="px-2 ">
        {userId != postDetails?.author?._id &&
          (!isFollowing ? (
            // Display follow button if not following
            <button className="btn btn-primary mt-3" onClick={followHandler}>
              Follow
            </button>
          ) : (
            // Display following button if already following
            <button
              className="hover:btn-primary-content btn mt-3"
              onClick={unfollowHandler}
            >
              Following
            </button>
          ))}
      </div>
    </div>
  );
};

export default PostAuthorCard;