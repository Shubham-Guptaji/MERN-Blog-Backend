import { Link, useNavigate } from "react-router-dom";
import convertUrl from "../../Helper/imageToWebp";

const AuthRecent = (props) => {
  // Get the navigate function from react-router-dom
  const navigate = useNavigate();

  return (
    <>
      {/* Card component with image and details */}
      <div className="card mb-3 bg-base-100 shadow-xl lg:card-side">
        <figure className="lg:w-3/12 ">
          {/* Image with onClick event to navigate to post page */}
          <img
            src={convertUrl(props.element.public_image.resource_url)}
            alt={props.element.title}
            height="1600px"
            width="900px"
            className="w-full aspect-video"
            onClick={() => {
              navigate(`/posts/${props.element.url}`);
            }}
          />
        </figure>
        <div className="card-body lg:w-9/12">
          {/* Author information and likes */}
          <div className="mt-1 flex items-center gap-2 font-semibold">
            <img
              src={props.element.author.avatar.secure_url}
              alt={props.element.author.username}
              className="h-8 w-8 rounded-full"
            />
            <Link to={`/username/${props.element.author.username}`}>
              {props.element.author.firstName} {props.element.author.lastName}
            </Link>
            <div className="ms-auto">{props.element.likes} Likes</div>
          </div>
          {/* Post title and description with onClick event to navigate to post page */}
          <h2
            className="card-title line-clamp-2 cursor-pointer text-indigo-600"
            onClick={() => {
              navigate(`/posts/${props.element.url}`);
            }}
          >
            {props.element.title}
          </h2>
          <p
            className="line-clamp-3 text-justify font-medium text-gray-600 cursor-pointer"
            onClick={() => {
              navigate(`/posts/${props.element.url}`);
            }}
          >
            {props.element.metaDescription}
          </p>
        </div>
      </div>
    </>
  );
};

export default AuthRecent;