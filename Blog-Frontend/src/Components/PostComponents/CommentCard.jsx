import { useState } from "react";
import { FaSave } from "react-icons/fa";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteComment, editComment, fetchComments } from "../../Redux/CommentSlice";

// Component to display a single comment
const CommentCard = ({ comment, postDetails }) => {
  const dispatch = useDispatch();
  const [commentedit, setCommentEdit] = useState(false);
  const [commentData, setCommentData] = useState(comment?.content);

  // Get the current user's role and ID from the Redux store
  const role = useSelector((state) => state?.auth?.role);
  const userId = useSelector((state) => state?.auth?.data?.id);

  // Handler to delete a comment
  const deleteHandler = async (commentId) => {
    let response = await dispatch(deleteComment(commentId));
    if (response?.payload?.success) {
      // Refetch comments after deletion
      dispatch(fetchComments({ blogId: postDetails?._id }));
    }
  };

  // Handler to update a comment
  const updateHandler = async () => {
    if (commentData == "") return; // Don't update if comment is empty
    const response = await dispatch(editComment({ commentId: comment._id, comment: commentData }));
    if (response?.payload?.success) {
      // Refetch comments after update
      dispatch(fetchComments({ blogId: postDetails?._id }));
      setCommentEdit(false); // Toggle edit mode off
    }
    setCommentEdit(false); // Toggle edit mode off in any case
  };

  return (
    <div key={comment._id}>
      <div className="mt-6 flex items-center gap-3">
        <img
          src={comment?.commentAuthor?.image?.secure_url}
          alt={comment?.commentAuthor?.fullName}
          className="h-10 w-10 rounded-full"
        />
        <Link to={`/username/${comment?.commentAuthor?.username}`} >

        <h4 className="me-2 w-fit text-nowrap text-xl font-semibold text-indigo-800">
          {comment?.commentAuthor?.fullName}
        </h4>
        </Link>
        {(comment?.commentAuthor?.id == userId || role == "admin") && (
          <div className="ms-auto flex items-center gap-2">
            {!commentedit ? (
              // Show edit button if not in edit mode
              <MdModeEdit
                className="h-6 w-6 cursor-pointer text-primary"
                onClick={() => setCommentEdit(true)}
              />
            ) : (
              // Show save button if in edit mode
              <FaSave
                className="h-6 w-6 cursor-pointer text-primary"
                onClick={updateHandler}
              />
            )}
            <MdDelete
              className="h-6 w-6 cursor-pointer text-primary"
              onClick={() => deleteHandler(comment._id)}
            />
          </div>
        )}
      </div>
      {!commentedit ? (
        // Display comment text if not in edit mode
        <p className="mt-2 px-2 text-base text-gray-800">{commentData}</p>
      ) : (
        // Display textarea for editing if in edit mode
        <textarea
          className="mt-3 h-24 w-full rounded-md border-2 border-indigo-600 p-2"
          placeholder="Your comment here"
          value={commentData}
          onChange={(event) => setCommentData(event.target.value)}
        ></textarea>
      )}
    </div>
  );
};

export default CommentCard;