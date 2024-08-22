import { useNavigate } from "react-router-dom";

import Layout from "../Layout/Layout";

// Component for displaying a 403 Access Denied page
const Denied = () => {
  const navigate = useNavigate();
  return (
    <Layout >
        <main className="min-h-[80vh] w-full flex flex-col justify-center items-center ">
      <h1 className="text-9xl font-extrabold text-indigo-700 tracking-widest">
        403
      </h1>
      <div className="bg-black text-white px-2 text-sm rounded rotate-12 absolute">
        Access Denied
      </div>
      <button className="mt-5">
        <a className="relative inline-block text-sm font-medium text-[#FF6A3D] group active:text-yellow-500 focus:outline-none focus:ring">
          <span className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-[#FF6A3D] group-hover:translate-y-0 group-hover:translate-x-0" />

          <span
            onClick={() => navigate(-1)}
            className="relative block px-8 py-3 bg-[#1A2238] border border-current"
          >
            Go Back
          </span>
        </a>
      </button>
    </main>
    </Layout>
  );
};

export default Denied;