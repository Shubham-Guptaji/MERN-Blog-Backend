import "./Post.css";

import Blocks from "editorjs-blocks-react-renderer";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

// Importing components and helpers
import Layout from "../../Layout/Layout";
import { getPost } from "../../Redux/blogSlice";
import { fetchComments } from "../../Redux/CommentSlice";
import { CreateComment } from "../../Redux/CommentSlice";
import {
  DisLikeHandler,
  IsFollowing,
  LikeHandler,
  PostLike,
} from "../../Redux/Miscellaneous";
import CommentCard from "../../Components/PostComponents/CommentCard";
import PostCard from "../../Components/PostComponents/PostCard";
import { MdEditSquare, MdDeleteForever } from "react-icons/md";
import PostHead from "../../Components/PostComponents/PostHead";
import PostDeletion from "../../Components/PostComponents/PostDeletion";
import SharePost from "../../Components/PostComponents/SharePost";
import PostAuthorCard from "../../Components/PostComponents/PostAuthorCard";
import convertUrl from "../../Helper/imageToWebp";

const Post = () => {
  // Getting URL and user ID from params and state
  const url = useParams().url;
  const userId = useSelector((state) => state?.auth?.data?.id);
  const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
  const role = useSelector((state) => state?.auth?.data?.role) || null;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selecting likes, isLiked, and post comments from state
  const likes = useSelector((state) => state?.misc?.postLikes);
  const isLiked = useSelector((state) => state?.misc?.isLiked);
  const postComments = useSelector((state) => state?.comment?.comments);
  const recentPosts = useSelector(
    (state) => state?.blog?.currentPost?.recentPosts
  );

  // State for new comment and deletion status
  const [isDeleting, setIsDeleting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { postDetails } = useSelector((state) => state?.blog?.currentPost);

  let postData;
  try {
    // Parsing post content
    if (postDetails?.content) postData = JSON.parse(postDetails.content);
  } catch (error) {
    navigate("/posts");
  }

  // Like function handler
  const Likefn = async () => {
    if (!isLoggedIn) {
      toast.error("Login to Like the Post..");
      return;
    }
    const data = { postId: postDetails?._id };
    if (!isLiked) await dispatch(LikeHandler(data));
    else await dispatch(DisLikeHandler(data));
  };

  // Use effect to handle post data and comments
  useEffect(() => {
    if (!url) return navigate("/posts");
    PostHandler(url);
  }, [url]);

  // Post handler function
  const PostHandler = async () => {
    const response = await dispatch(getPost({ url, userId }));
    if (!response?.payload?.success) {
      navigate("/not-found");
    }
    dispatch(fetchComments({ blogId: response?.payload?.postDetails?._id }));
    let data = { postId: response?.payload?.postDetails?._id, userId };
    dispatch(PostLike(data));
    const authId = response?.payload?.postDetails?.author?._id;
    if (isLoggedIn && authId) dispatch(IsFollowing({ authId }));
  };

  // Comment handler function
  const commentHandler = async (event) => {
    event.preventDefault();
    if (!isLoggedIn) return toast.error("Login to comment..");
    if (newComment == "") return;
    let response = await dispatch(
      CreateComment({ blogId: postDetails?._id, comment: newComment })
    );
    if (response?.payload?.success) {
      setNewComment("");
      dispatch(fetchComments({ blogId: postDetails?._id }));
    }
  };

  // Post config for Blocks component
  const postConfig = {
    code: {
      className: "language-js",
    },
    delimiter: {
      className: "border border-2 w-16 mx-auto",
    },
    embed: {
      className: "border-0",
    },
    header: {
      className: "font-bold text-indigo-600",
    },
    image: {
      className: "w-full max-w-screen-md mx-auto",
      actionsClassNames: {
        stretched: "w-full h-80 object-cover",
        withBorder: "border border-2",
        withBackground: "p-2",
      },
    },
    list: {
      className: "list-inside my-4",
    },
    paragraph: {
      className: "text-base text-justify text-opacity-75 my-4 sm:leading-7 ",
    },
    quote: {
      className:
        "py-3 px-5 italic font-serif w-full my-5 bg-gray-100 rounded-md",
    },
    table: {
      className: "table-auto w-full ",
    },
  };
  const ChangeDeletionStat = (bool) => setIsDeleting(bool);

  return (
    <Layout>
      {postDetails?.title && (<PostHead postDetails={postDetails} url={url}/>)}

      <PostDeletion data={{id: postDetails._id, authorId: postDetails.author, changeDeleteStat: ChangeDeletionStat, isDeleting: isDeleting}}/>

      <div className="container mx-auto px-4">
        <div className="post mx-auto my-10 w-full max-w-4xl">
          <h1 className="my-5 text-center text-2xl font-semibold text-indigo-600 md:text-3xl lg:text-4xl">
            {postDetails.title}
          </h1>
          {postDetails?.public_image?.resource_url && (

            <div className="relative w-full">
              <img
                src={convertUrl(postDetails.public_image.resource_url)}
                alt={postDetails.title}
                className="mx-auto my-4 h-auto w-full rounded-xl p-2"
                width="1920"
                height="1080"
              />
              {((userId && userId == postDetails.author._id) ||
                (role && role == "admin")) && (

                <div className="absolute right-0 top-0 m-2 flex gap-2">
                  <div
                    className="glass w-fit cursor-pointer rounded hover:bg-gray-200"
                    onClick={() => {
                      let post = postDetails;
                      navigate("/update", {
                        state: { post },
                      });
                    }}
                  >
                    <MdEditSquare className="h-8 w-8 text-white hover:text-blue-600" />
                  </div>
                  <div
                    className="glass w-fit cursor-pointer rounded hover:bg-gray-200"
                    onClick={() => ChangeDeletionStat(true)}
                  >
                    <MdDeleteForever className="h-8 w-8 text-white hover:text-blue-600" />
                  </div>
                </div>
              )}
            </div>
          )}

          <SharePost postDetails={postDetails} url={url} />

          {postData && <Blocks data={postData} config={postConfig} />}
          <div className="my-4 flex items-center gap-2 font-semibold">
            <span>Do You like this Post ?</span>{" "}
            <span className="cursor-pointer ">
              {!isLiked ? (
                <AiOutlineHeart className="h-6 w-6" onClick={Likefn} />
              ) : (
                <AiFillHeart
                  className="h-6 w-6 fill-indigo-600"
                  onClick={Likefn}
                />
              )}
            </span>
            <span>{likes}</span>
          </div>

          {/* About Author  */}

          <PostAuthorCard postDetails={postDetails} />

          {/* Comment Section */}

          <div className="mt-8">
            <h2 className="text-2xl font-semibold">Comments :</h2>
            {isLoggedIn ? (
              <form className="mt-4 w-full px-4" onSubmit={commentHandler}>
                <textarea
                  className="h-24 w-full rounded-md border-2 border-indigo-600 p-2 "
                  placeholder="Your comment here"
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                ></textarea>
                <button className="btn btn-primary mt-4 ">Add comment</button>
              </form>
            ) : (
              <p className="mt-3 text-center text-lg font-semibold">
                Login to comment on this Post.
              </p>
            )}
            <div className="mt-8">
              {postComments?.map((comment) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  postDetails={postDetails}
                />
              ))}
            </div>
            <hr className="mt-8" />
            <div className="mt-8">
              <h4 className="text-xl font-semibold text-indigo-600 sm:text-3xl">
                Posts you may like
              </h4>
              <div className="mt-6 flex flex-wrap justify-center gap-5">
                {recentPosts?.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Post;
