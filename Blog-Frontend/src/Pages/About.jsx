
import AboutImg from "../assets/about.svg";
import Layout from "../Layout/Layout";

// About component
const About = () => {
  return (
    <Layout>
      <div>
        {/* Hero Section */}
        <div className=" py-10 xl:py-20 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex flex-col-reverse items-center justify-center lg:flex-row">
              <div className="max-w-xl text-center xl:mr-8 lg:text-left">
                <h1 className="mb-6 text-4xl font-bold lg:text-5xl text-indigo-500">
                  Welcome to Alcodemy Blog!
                </h1>
                <p className="mb-8 text-lg lg:text-xl">
                  At Alcodemy Blog, we're more than just a platform for sharing
                  insights and ideas. We're a community of passionate
                  individuals dedicated to fostering knowledge exchange and
                  growth.
                </p>
                <p className="text-lg lg:text-xl">
                  Whether you're a seasoned professional, a budding enthusiast,
                  or anyone in between, Alcodemy Blog is your go-to destination
                  for engaging content, vibrant discussions, and endless
                  learning opportunities.
                </p>
              </div>
              <div className="w-full lg:w-1/2">
                <img
                  src={AboutImg}
                  alt="Alcodemy Blog"
                  className="mx-auto mb-8 lg:mb-0 lg:ml-auto "
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl md:text-left text-justify">
            <h2 className="mb-4 text-3xl font-bold text-indigo-600">
              Who We Are:
            </h2>
            <p className="mb-6 text-lg">
              Alcodemy Blog is a vibrant online space where voices from all
              walks of life converge to share their expertise, experiences, and
              perspectives. Founded with the vision of democratizing knowledge
              and fostering a culture of collaboration, we believe that everyone
              has something valuable to contribute.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-indigo-600">
              Our Mission:
            </h2>
            <p className="mb-6 text-lg">
              Our mission at Alcodemy Blog is simple: to empower individuals to
              learn, grow, and connect through the power of shared knowledge.
              Whether you're here to explore the latest trends in technology,
              dive into the depths of data science, or simply find inspiration
              for your next project, we're here to support you every step of the
              way.
            </p>

            <h2 className="mb-4 text-3xl font-bold text-indigo-600">
              What We Offer:
            </h2>
            <ul className="mb-6 list-disc pl-6 text-lg">
              <li>
                <strong>Diverse Content:</strong> From tutorials and guides to
                thought-provoking opinion pieces, our platform hosts a diverse
                range of content catering to various interests and skill levels.
              </li>
              <li>
                <strong>Interactive Community:</strong> Join a community of
                like-minded individuals who are passionate about technology,
                innovation, and continuous learning. Engage in discussions,
                leave comments, and connect with fellow enthusiasts from around
                the globe.
              </li>
              <li>
                <strong>User-Friendly Interface:</strong> Our intuitive platform
                makes it easy for users to navigate, discover, and consume
                content that matters to them. Whether you're here to read,
                comment, or contribute your own insights, we've designed
                Alcodemy Blog with your user experience in mind.
              </li>
            </ul>

            <h2 className="mb-4 text-3xl font-bold text-indigo-600">
              Get Involved:
            </h2>
            <p className="mb-6 text-lg">
              Ready to join the conversation? Whether you're a seasoned expert
              or a curious learner, there's a place for you at Alcodemy Blog.
              Sign up today to start exploring, engaging, and contributing to
              our vibrant community of tech enthusiasts!
            </p>
            <p className="text-lg">
              At Alcodemy Blog, the journey of learning never ends. Join us
              today and become a part of something extraordinary.
            </p>

            {/* Add other sections like Mission, What We Offer, Get Involved here */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
