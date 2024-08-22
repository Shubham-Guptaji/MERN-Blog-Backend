import { useState } from "react";
import toast from "react-hot-toast";

import ContactImage from "../assets/undraw_things_to_say_re_jpcg.svg"
import axiosInstance from "../Helper/axiosInstance";
import Layout from "../Layout/Layout";

// Contact component
const Contact = () => {
  // Initialize state for user input
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserInput({ ...userInput, [name]: value });
  };

  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    // Check if all fields are filled
    if (
      !userInput.name ||
      !userInput.email ||
      !userInput.subject ||
      !userInput.message
    ) {
      toast.error("All fields are mandatory.");
      return;
    }

    // Validate email using regex
    if (
      !userInput.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ) {
      toast.error("Invalid email id");
      return;
    }

    try {
      // Post data to API using axios
      let res = axiosInstance.post("/contact", { ...userInput });
      toast.promise(res, {
        loading: "Submitting contact form",
        success: (data) => {
          return data?.data?.message;
        },
        error: "Failed to Submit the form",
      });
      res = await res;
      // Clear input fields on successful submission
      if (res?.data?.success) {
        setUserInput({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Layout>
      <div className="isolate min-h-[calc(100dvh-240px)] bg-white px-6 py-24 sm:py-32 lg:px-8 flex gap-3 items-center lg:flex-row flex-col">
        <div className="lg:w-6/12 mb-16">
          <img src={ContactImage} alt="Alcodemy Contact" className="w-full" />
        </div>
        <div className="lg:w-6/12">
          {/* Background gradient */}
          <div
            className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
            aria-hidden="true"
          >
            <div
              className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Contact Alcodemy
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Got questions or feedback? Reach out using the form below!
            </p>
          </div>
          {/* Contact form */}
        <form
          className="mx-auto mt-16 max-w-xl sm:mt-20"
          onSubmit={handleFormSubmit}
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Name
            </label>
            <div className="mt-2.5">
              <input
                type="text"
                name="name"
                id="name"
                value={userInput.name}
                onChange={handleInputChange}
                autoComplete="given-name"
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="mt-2 sm:col-span-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Email
            </label>
            <div className="mt-2.5">
              <input
                type="email"
                name="email"
                id="email"
                value={userInput.email}
                onChange={handleInputChange}
                autoComplete="email"
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="mt-2 sm:col-span-2">
            <label
              htmlFor="subject"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Subject
            </label>
            <div className="mt-2.5">
              <input
                type="text"
                name="subject"
                id="subject"
                value={userInput.subject}
                onChange={handleInputChange}
                autoComplete="subject"
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="mt-2 sm:col-span-2">
            <label
              htmlFor="message"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Message
            </label>
            <div className="mt-2.5">
              <textarea
                name="message"
                id="message"
                rows={4}
                value={userInput.message}
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="mt-10">
            <button
              type="submit"
              className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Let&apos;s talk
            </button>
          </div>
        </form>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
