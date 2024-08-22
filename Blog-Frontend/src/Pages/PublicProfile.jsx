
import { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BlockUser, deleteAccount, fetchDash, UnBlockUser } from "../Redux/authSlice";
import { FaThumbsUp } from "react-icons/fa";
import { RiMessage2Fill } from "react-icons/ri";
import { HiMiniUserGroup } from "react-icons/hi2";
import toast from "react-hot-toast";
import { BsFileEarmarkPostFill } from "react-icons/bs";
import { IoPerson } from "react-icons/io5";
import PostTemplate from "../Components/DashBoard/PublicProfileComponents/PostTemplate";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Follow, IsFollowing, UnFollow } from "../Redux/Miscellaneous";
import imgBg from "../assets/imgBg.webp";
import convertUrl from "../Helper/imageToWebp";

const PublicProfile = () => {
  // Get the username from the URL params
  const username = useParams().username;
  const navigate = useNavigate();
  const areMore = useSelector(state => state?.auth?.profile?.areMore);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state?.auth?.isLoggedIn);
  const isVerified = useSelector(state => state?.auth?.data?.isVerified)
  const MyId = useSelector(state => state?.auth?.data?.id)
  const role = useSelector(state => state?.auth?.role);
  const [currentPage, setCurrentPage] = useState(0);
  const data = useSelector((state) => state?.auth?.profile?.data);
  const userId = data?._id;
  const isBlocked = data?.isBlocked;
  const isFollowing = useSelector((state) => state?.misc?.isFollowing);
  const followId = useSelector((state) => state?.misc?.followId);
  
  // Set the background image for the profile header
  let bgImage = data?.bgImage?.secure_url ? data?.bgImage?.secure_url : imgBg;

  // Handle account deletion
  async function deletionHandler() {
    let res = await dispatch(deleteAccount({id: userId}));
    if(res?.payload?.success) {
      navigate('/posts')
    }
  }

  // Handle follow/unfollow button click
  const followHandler = async () => {
    if (!isLoggedIn) return toast.error("Login to follow..");
    if (!isVerified) return toast.error("Your account isn't verified yet");
    dispatch(
      Follow({ authId: userId })
    );
  };

  const unfollowHandler = async () => {
    if (!isLoggedIn || !followId)
      return toast.error("You should be loggedin with followId.");
    dispatch(UnFollow({ FollowId: followId }));
  };

  // Handle block/unblock user button click
  async function blockUnblockUserfn() {
    if (!isLoggedIn) return toast.error("Login to block..");
    if (role != "admin") return toast.error("You are not authorized to do this.")
    if (data) {
      if(!isBlocked) await dispatch(BlockUser({id: userId, username: data?.username}));
      else await dispatch(UnBlockUser({id: userId, username: data?.username}));
    }
  }

  useEffect(() => {
    // Check if the user is logged in, if not redirect to sign-in page
    if(!isLoggedIn) {
      toast.error("Login to see Author Profile");
      navigate("/sign-in");
      return
    }
    // Fetch the user's profile data
    const effectFn = async () => {
      let obj = { skip: currentPage * 20 };
      const res = await dispatch(fetchDash({ username, obj }));
      if(!res?.payload) navigate("/");
      window.scrollTo(0, 0);
      if (isLoggedIn && res?.payload?.userDetails) {
        await dispatch(IsFollowing({ authId: res?.payload?.userDetails?._id }));
      }
    };
    effectFn();
  }, [currentPage]);

  return (
    <Layout>
      {data && (
        <>
          <div className="container mx-auto md:w-10/12">
            <div
              className="relative mb-14 min-h-52 w-full rounded shadow-md shadow-gray-600 sm:min-h-60 lg:mb-16 lg:min-h-72 xl:min-h-[350px]"
              style={{
                backgroundImage: `url(${convertUrl(bgImage)})`,
                backgroundSize: "Cover",
              }}
            >
              <div className="absolute -bottom-16 left-0 flex w-2/6 min-w-44 items-center lg:-bottom-20  lg:min-w-52">
                <img
                  src={data?.avatar?.secure_url}
                  width={400}
                  height={400}
                  className="m-5 aspect-square w-full max-w-72 rounded shadow-lg shadow-gray-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-5 xl:flex-row">
              <div className="flex h-full flex-col items-center justify-center rounded xl:w-3/5 ">
                <h2 className="bold text-xl text-primary lg:px-5 lg:text-4xl">
                  {data?.firstName + " " + data?.lastName}
                </h2>
                <p className="px-5 text-justify text-lg italic text-gray-700">
                  {data?.bio}
                </p>

                <div className="px-2 flex gap-2 items-center justify-center mt-3">
              {MyId != userId && (!isFollowing ? (
                <button
                  className="btn btn-primary"
                  onClick={followHandler}
                >
                  Follow
                </button>
              ) : (
                <button
                  className="hover:btn-primary-content btn "
                  onClick={unfollowHandler}
                >
                  Following
                </button>
              ))}
              {isLoggedIn &&  role === "admin" && userId != MyId && ( !isBlocked ?
                (<button type="button" className="btn btn-error" onClick={blockUnblockUserfn}>Block</button>) :
                (<button type="button" className="btn btn-info" onClick={blockUnblockUserfn}>Unblock</button>)
              )}

            </div>
              </div>
              <div className="lg:mt-3 flex flex-col px-5 xl:w-2/5 xl:px-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-lg font-semibold lg:text-xl ">
                    Username :
                  </h3>
                  <p className="text-pretty text-lg text-primary">
                    {data?.username}
                  </p>
                </div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-lg font-semibold lg:text-xl ">Email :</h3>
                  <p className="text-pretty text-lg text-primary">
                    {data?.email}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="flex flex-row items-center gap-2">
                    <FaThumbsUp className="h-6 w-6 text-blue-700" />{" "}
                    {data?.likes}
                  </span>
                  <span className="flex flex-row items-center gap-2">
                    <HiMiniUserGroup className="h-8 w-8 text-indigo-700" />{" "}
                    {data?.followers}
                  </span>
                  <span className="flex flex-row items-center gap-2">
                    <RiMessage2Fill className="h-6 w-6 text-blue-700" />{" "}
                    {data?.comments}
                  </span>
                  <span className="flex flex-row items-center gap-2">
                    <IoPerson className="h-6 w-6 text-indigo-700" />{" "}
                    {data?.following}
                  </span>
                  <span className="flex flex-row items-center gap-2">
                    <BsFileEarmarkPostFill className="h-6 w-6 text-blue-700" />{" "}
                    {data?.postPublished}
                  </span>
                </div>
                {isLoggedIn &&  role === "admin" && (
                    <div className="mt-5 flex gap-3 flex-wrap ">
                    <button type="button" className="btn btn-error w-fit" onClick={()=>document.getElementById('my_modal_4').showModal()}>
                Delete Account
              </button>
              <button type="button" className="btn btn-primary w-fit" onClick={() =>
                    navigate("/create", {
                      state: { userId },
                    })}>
                Create Post
              </button>
              </div>
            )}
              <dialog id="my_modal_4" className="modal">
                    <div className="modal-box">
                      <h3 className="font-bold text-lg text-red-700">Confirm Delete Account</h3>
                      <p className="py-4 text-black">Are you sure you want to delete this account that belongs to {data?.firstName} ?</p>
                      <p className="py-4 text-black">Once the account deletion process has begun, account holder won't be able to reactivate their account or retrieve any of the content, posts and information they have added.</p>
                      <div className="modal-action">
                        <button className="btn hover:btn-error" onClick={() => deletionHandler()}>Delete</button>
                        <form method="dialog">
                          <button className="btn btn-info">Close</button>
                        </form>
                      </div>
                    </div>
                  </dialog>
              </div>
              
            </div>
            <hr className="my-8 border-t-2 border-gray-800" />
            <h1 className="my-7 text-2xl font-semibold text-primary lg:text-3xl mx-3">
        Posts by {data.firstName}
      </h1>
            <div className="my-10 mx-3 grid justify-center gap-3 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.blogPosts && data?.blogPosts?.length != 0 && data?.blogPosts.map((element) => (
            <PostTemplate element={element} key={element._id} />
          ))}
          
        </div>

        {
            (!data?.blogPosts || data?.blogPosts?.length == 0) && (
              <div className="flex flex-col items-center justify-center h-60 w-full text-2">
          <h1 className="text-2xl font-semibold text-primary lg:text-3xl ">
            There are no posts available right now
          </h1>
        </div>
            )
          }

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
        </>
      )}
    </Layout>
  );
};
export default PublicProfile;
