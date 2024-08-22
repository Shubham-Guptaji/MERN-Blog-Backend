import { useEffect, useState } from "react";
import { FaThumbsUp, FaTrash } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchDash } from "../../Redux/authSlice";
import { deletePost, publishPost, unPublishPost } from "../../Redux/blogSlice";
import convertUrl from "../../Helper/imageToWebp";

const AuthRecent = ({ post }) => {
  // Get navigate function from react-router-dom
  const navigate = useNavigate();
  // Get username from Redux state
  const { username } = useSelector((state) => state?.auth?.data);
  // Get dispatch function from Redux
  const dispatch = useDispatch();
  // Initialize isActive state with false
  const [isActive, setIsActive] = useState(false);

  // Toggle post status (published/unpublished)
  function postStatus() {
    if (isActive) {
      setIsActive(false);
      dispatch(unPublishPost({ id: post._id }));
    } else {
      setIsActive(true);
      dispatch(publishPost({ id: post._id }));
    }
  }

  // Delete post handler
  async function deleteHandler() {
    const response = await dispatch(
      deletePost({ id: post._id, authorId: post.author })
    );
    if (response?.payload?.success) {
      dispatch(fetchDash({ username }));
    }
  }

  // Set initial isActive state based on post.isPublished
  useEffect(() => {
    setIsActive(post.isPublished);
  }, []);

  return (
    <>
      <div className="card mb-3 bg-base-100 shadow-xl lg:card-side">
        <figure className="lg:w-3/12 ">
          <img
            src={convertUrl(post.public_image.resource_url)}
            alt={post.title}
            height="1600px"
            width="900px"
            className="aspect-video w-full"
            onClick={() => {
              navigate(`/posts/${post.url}`);
            }}
          />
        </figure>
        <div className="card-body lg:w-9/12">
          <div className="mt-1 flex items-center gap-2 font-semibold">
            <div>
              <span
                className={`${isActive ? "text-green-500" : "text-red-800"}`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="ms-auto flex items-center justify-center gap-2">
              {/* Toggle post status */}
              <input
                type="checkbox"
                className="toggle toggle-success toggle-sm"
                checked={isActive}
                onChange={postStatus}
              />

              {/* Edit post button */}
              <MdEditSquare className="h-6 w-6 text-purple-700 cursor-pointer" onClick={() =>
                  //   {
                  //     console.log(post)
                  //     navigate("/update", {
                  //     state: { post },
                  //   });
                  // }
                  {
                    const updatedPost = { ...post };
                    updatedPost.author = {_id: null};
                    updatedPost.author._id = post?.author;
                    navigate("/update", { state: { post: updatedPost } });
                }
                  } />

              {/* Delete post button */}
              <button
                onClick={() =>
                  document.getElementById("my-delete-modal").showModal()
                }
              >
                <FaTrash className="h-4 w-4 text-red-600" />
              </button>

              {/* Delete post modal */}
              <dialog id="my-delete-modal" className="modal">
                <div className="modal-box">
                  <h3 className="text-lg font-bold text-indigo-700">
                    Confirm Delete
                  </h3>
                  <p className="py-4 text-black">
                    Are you sure you want to delete this post ?
                  </p>
                  <div className="modal-action">
                    <form method="dialog">
                      <button className="btn me-2" onClick={deleteHandler}>
                        Confirm
                      </button>
                      {/* Close modal button */}
                      <button className="btn">Close</button>
                    </form>
                  </div>
                </div>
              </dialog>

              {/* Post likes */}
              <span className="flex items-center gap-1 text-primary">
                <FaThumbsUp className="h-4 w-4" /> {post.likes}
              </span>
            </div>
          </div>
          <h2
            className="card-title line-clamp-2 cursor-pointer text-indigo-600"
            onClick={() => {
              navigate(`/posts/${post.url}`);
            }}
          >
            {post.title}
          </h2>
          <p
            className=" line-clamp-3 cursor-pointer text-justify font-medium text-gray-600"
            onClick={() => {
              navigate(`/posts/${post.url}`);
            }}
          >
            {post.metaDescription}
          </p>
        </div>
      </div>
    </>
  );
};

export default AuthRecent;