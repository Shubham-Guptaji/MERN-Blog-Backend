import { Link, useNavigate } from "react-router-dom";
import convertUrl from "../../Helper/imageToWebp";

// TrendingCards component displays a single trending post
const TrendingCards = (props) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="card max-w-96 bg-base-100 shadow-xl">
        <figure>
          <img
            // Convert image URL to WebP format
            src={convertUrl(props.element.public_image.resource_url)}
            alt={props.element.title}
            height="1600px"
            width="900px"
            className="aspect-video cursor-pointer"
            onClick={() => {
              // Navigate to post details page on image click
              navigate(`/posts/${props.element.url}`);
            }}
          />
        </figure>
        <div className="card-body">
          <h2
            className="card-title line-clamp-2 cursor-pointer text-indigo-600"
            onClick={() => {
              // Navigate to post details page on title click
              navigate(`/posts/${props.element.url}`);
            }}
          >
            {props.element.title}
          </h2>
          <p className=" line-clamp-3 text-justify font-medium text-gray-600">
            {props.element.metaDescription}
          </p>
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
          <div className="card-actions mt-3 justify-end">
            <Link
              className="btn btn-primary bg-indigo-700 px-5 text-[17px] tracking-wider"
              to={`/posts/${props.element.url}`}
            >
              Read
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrendingCards;