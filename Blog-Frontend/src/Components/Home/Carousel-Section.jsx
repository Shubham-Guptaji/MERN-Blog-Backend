import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import convertUrl from "../../Helper/imageToWebp";

const Carousel = ({ post }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance the carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % post.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    // Move to the next slide
    setCurrentIndex((prevIndex) => (prevIndex + 1) % post.length);
  };

  const prevSlide = () => {
    // Move to the previous slide
    setCurrentIndex((prevIndex) => (prevIndex - 1 + post.length) % post.length);
  };

  return (
    <>
      {post?.length && (
        <div className="relative mb-8 h-0  w-full overflow-hidden rounded pb-[56.25%]  shadow-lg shadow-primary ring-2 ring-indigo-600">
          <div
            className="absolute left-0 top-0 flex h-full  w-full transition-transform duration-1000"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {post.map((element) => (
              <div
                key={element._id}
                className="relative w-full flex-shrink-0 cursor-pointer"
                onClick={() => {
                  navigate(`/posts/${element.url}`);
                }}
              >
                <img
                  src={convertUrl(element.public_image.resource_url)}  
                  alt={element.title}
                  className="aspect-video  h-auto w-full object-cover "
                />
                <div
                  className="absolute bottom-0 left-0 w-full  p-4 text-white"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0, 0, 0, 1), rgba(55, 65, 81, 0.8), rgba(209, 213, 219, 0.2))",
                  }}
                >
                  <h2 className="line-clamp-1 text-center text-xl">
                    {element.title}
                  </h2>
                  <p className="mb-7 line-clamp-2 text-center">
                    {element.metaDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={prevSlide}
            className={`absolute left-0 top-1/2  ms-2 -translate-y-1/2 transform rounded bg-white p-2 shadow shadow-black ${(post && post.length < 2) && "hidden"}`}
          >
            <span>
              <FaAnglesLeft className="h-6 w-6" />
            </span>
          </button>
          <button
            onClick={nextSlide}
            className={`absolute right-0 top-1/2 me-2 -translate-y-1/2 transform rounded bg-white p-2 shadow shadow-black ${(post && post.length < 2) && "hidden"}`}
          >
            <span>
              <FaAnglesRight className="h-6 w-6" />
            </span>
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
            {post.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 rounded-full ${index === currentIndex ? "bg-white" : "bg-gray-400"}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Carousel;