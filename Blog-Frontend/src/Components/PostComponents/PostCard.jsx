import { useNavigate } from "react-router-dom";
import convertUrl from "../../Helper/imageToWebp";

// PostCard component that displays a single post
const PostCard = ({ post }) => {
  const navigate = useNavigate();

  return (
    <div className="card bg-base-100 shadow-xl md:card-side w-full max-w-sm md:max-w-none">
      <figure className="md:w-3/12 ">
        {/* Post image with click event to navigate to post detail page */}
        <img
          src={convertUrl(post?.public_image?.resource_url)}
          alt={post?.title}
          height="1600px"
          width="900px"
          className="aspect-video w-full"
          onClick={() => {
            navigate(`/posts/${post?.url}`);
          }}
        />
      </figure>
      <div className="card-body md:w-9/12">
        {/* Post title with click event to navigate to post detail page */}
        <h2 className="card-title line-clamp-2 text-indigo-600 cursor-pointer" onClick={() => {
          navigate(`/posts/${post?.url}`);
        }}>
          {post?.title}
        </h2>
        {/* Post meta description */}
        <p className=" line-clamp-3 cursor-pointer text-justify font-medium text-gray-600 ">
          {post?.metaDescription}
        </p>
      </div>
    </div>
  );
};

export default PostCard;