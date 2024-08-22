import { useDispatch, useSelector } from "react-redux";
import { deletePost } from "../../Redux/blogSlice";
import { useNavigate } from "react-router-dom";

// Component to handle post deletion
const PostDeletion = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);

  // Function to handle post deletion
  async function deletePostHandler() {
    // Check if user is logged in before deleting post
    if (!isLoggedIn) return toast.error("Login to delete..");
    const response = await dispatch(
      deletePost({ id: data.id, authorId: data.author })
    );
    // If post deletion is successful, navigate back to previous page
    if (response?.payload?.success) {
      navigate(-1);
    }
  }

  return (
    <div
      className={`relative z-10 ${!data?.isDeleting && "hidden"}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal background */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      ></div>

      {/* Modal content */}
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            {/* Modal header */}
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  {/* Warning icon */}
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  {/* Modal title */}
                  <h3
                    className="text-base font-semibold leading-6 text-gray-900"
                    id="modal-title"
                  >
                    Delete This Post
                  </h3>
                  {/* Modal description */}
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this post? All of post's
                      Data including content, likes and comments will be removed
                      permanently. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Modal footer */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {/* Delete button */}
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                onClick={() => deletePostHandler()}
              >
                Delete
              </button>
              {/* Cancel button */}
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={() => data.changeDeleteStat(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDeletion;
