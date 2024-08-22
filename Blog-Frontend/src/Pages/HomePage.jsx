// Import necessary dependencies
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

// Import local components and assets
import homeImage from "../assets/undraw_Happy_news_re_tsbd.png";
import AuthRecent from "../Components/Home/Auth-Recent-Card";
import TrendingCards from "../Components/Home/Trending-Cards";
import Layout from "../Layout/Layout";
import { getHomePagePosts } from "../Redux/blogSlice";
import Carousel from "../Components/Home/Carousel-Section";

// Define the HomePage component
const HomePage = () => {
  // Get the dispatch function from react-redux
  const dispatch = useDispatch();
  // Get the navigate function from react-router-dom
  const Navigate = useNavigate();
  // Get the isLoggedIn and isVerified states from the auth reducer
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const isVerified = useSelector((state) => state.auth?.data?.isVerified);

  // Use the useEffect hook to fetch home page posts when the component mounts
  useEffect(() => {
    dispatch(getHomePagePosts());
  }, []);

  // Get the trendingPosts, popularAuthorPosts, and tags from the blog reducer
  const { trendingPosts, popularAuthorPosts, tags } = useSelector(
    (state) => state.blog
  );

  // Return the JSX for the HomePage component
  return (
    <Layout>
      {/* Header section */}
      <header className="container mx-auto flex flex-col-reverse px-3 md:w-10/12 md:flex-row">
        <div className=" flex h-[inherit]  items-center xl:w-4/6">
          <div className="h-fit w-full ">
            <h1 className=" text-center font-serif text-4xl font-bold text-indigo-600 md:text-start md:text-3xl lg:text-5xl xl:text-6xl">
              Unlocking the Creativity
            </h1>
            <p className="mt-4 text-justify text-xl font-semibold leading-8 md:mt-1 md:text-start lg:mt-3 lg:text-2xl lg:leading-9 xl:mt-7">
              Explore narratives, ideas, and knowledge shared by authors across
              diverse topics.
            </p>
            <button className="btn btn-primary mt-5 bg-indigo-700 text-xl md:mt-3 lg:mt-5 lg:tracking-wider xl:mt-9" onClick={()=> !isLoggedIn ? Navigate("/sign-up") : isVerified ? Navigate("/create") : toast.error("Please verify your account from your dashboard.")}>
              Create Own
            </button>
          </div>
        </div>
        <img
          src={homeImage}
          alt="Alcodemy Front Page"
          className="mx-auto mb-7 max-h-96 w-full max-w-96 md:mb-0 md:max-h-full md:w-2/4 md:max-w-full"
        />
      </header>
      <section className="container mx-auto px-3 md:w-10/12 ">
        <h2 className="mb-10 mt-12 text-center text-4xl font-bold border-b-8 border-double pb-5 border-green-400 w-fit mx-auto">
          Trending Posts
        </h2>
        <div className="w-full mx-auto lg:w-11/12">
          {(trendingPosts && trendingPosts.length != 0) ? <Carousel post={trendingPosts.slice(0, 3)} /> : 
            (
              <div className="flex flex-col items-center justify-center h-60 w-full text-2">
          <h1 className="text-2xl font-semibold text-primary lg:text-3xl ">
            There are no posts available right now
          </h1>
        </div>
            )}
        </div>
        <div className="w-fit mx-auto grid justify-center gap-3 sm:grid-cols-2 lg:grid-cols-3 ">
          {trendingPosts.slice(3).length != 0 && trendingPosts.slice(3).map((element) => (
            <TrendingCards element={element} key={element._id} />
          ))}
        </div>
      </section>
      <section className="container mx-auto px-3 md:w-10/12 ">
      <h2 className="mb-10 mt-12 text-center text-4xl font-bold border-b-8 border-double pb-5 border-green-400 w-fit mx-auto">
          Recent Posts
        </h2>
        <div className="flex flex-col-reverse gap-2 px-3 md:flex-row">
          <div className=" mx-auto max-w-[400px] justify-center md:w-8/12 md:max-w-full">
            {popularAuthorPosts && popularAuthorPosts.length != 0 && popularAuthorPosts.map((element) => (
              <AuthRecent element={element} key={element._id} />
            ))}
          </div>
          <div className="mx-auto mb-5 w-10/12 md:w-4/12">

            <div className="flex flex-wrap gap-3 px-2">
              {tags.length != 0 && tags.map((element) => {
                return (
                  <button
                    key={element}
                    className="rounded-full p-3 pb-2 pt-2 text-center text-indigo-600 ring-2"
                    onClick={() => Navigate("/posts", { state: { tag : element } })}
                  >
                    {element}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </section>
      <div className="container px-3 mx-auto mb-8 mt-7 md:w-10/12">
        <Link
          className="inline cursor-pointer rounded bg-indigo-600 p-5 pb-2 pt-2 text-2xl text-white hover:bg-indigo-700"
          to="/posts"
        >
          All Posts
        </Link>
      </div>
    </Layout>
  );
};
export default HomePage;
