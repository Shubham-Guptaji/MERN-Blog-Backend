import { useDispatch, useSelector } from "react-redux";
import imgBg from "../../assets/imgBg.webp";
import { useState } from "react";
import { MdEditSquare } from "react-icons/md";
import { IoSave } from "react-icons/io5";
import toast from "react-hot-toast";
import { backgroundImage, fetchDash } from "../../Redux/authSlice";
import convertUrl from "../../Helper/imageToWebp";

const Profile = (props) => {
  // Get the user data from the Redux store
  const data = useSelector((state) => state?.auth?.data);
  const dispatch = useDispatch();

  // Get the background image URL from the Redux store
  const bgURL = useSelector((state) => state?.auth?.profile?.data?.bgImage);
  const bgImage = bgURL?.secure_url ? bgURL?.secure_url : imgBg;

  // State variables for background image updating
  const [isBgUpdating, setBgUpdating] = useState(false);
  const [bgImg, setbgImg] = useState({
    bgImage: "",
  });
  const [previewImage, setPreviewImage] = useState("");

  // Handle image upload
  const getImage = (event) => {
    event.preventDefault();
    // Get the uploaded image
    const uploadedImage = event.target.files[0];
    if (uploadedImage) {
      setbgImg({
        bgImage: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setPreviewImage(this.result);
      });
    }
  };

  // Handle background image update
  async function bgImageHandler(events) {
    if (!bgImg.bgImage) {
      toast.error("Please upload an Image for Background.");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setBgUpdating(false);
      return;
    }
    const formData = new FormData();
    formData.append("bgImage", bgImg.bgImage);
    let res = await dispatch(backgroundImage(formData));
    if (res?.payload?.success) {
      await dispatch(fetchDash({ username: data?.username }));
      setBgUpdating(false);
    }
  }

  return (
    <>
      <h1 className="mb-7 text-2xl font-semibold text-primary lg:text-3xl">
        My Profile Page
      </h1>
      <div className="mx-auto my-auto mt-4 flex flex-col gap-3">
        {/* Display the background image */}
        {!isBgUpdating ? (
          <div
            className="relative mb-14 min-h-52 w-full rounded shadow-md shadow-gray-600 sm:min-h-60 lg:mb-16 lg:min-h-72 xl:min-h-[350px]"
            style={{
              backgroundImage: `url(${convertUrl(bgImage)})`,
              backgroundSize: "Cover",
            }}
          >
            <div className="absolute -bottom-16 left-0 flex w-2/6 min-w-44 items-center lg:-bottom-20 lg:min-w-52">
              <img
                src={data?.avatar?.secure_url}
                width={400}
                height={400}
                className="m-5 aspect-square w-full max-w-72 rounded shadow-lg shadow-gray-500"
              />
            </div>
            <div
              className="glass absolute right-0 top-0 m-2 w-fit cursor-pointer rounded hover:bg-gray-200"
              onClick={() => setBgUpdating(true)}
            >
              <MdEditSquare className="h-8 w-8 text-white hover:text-blue-600" />
            </div>
          </div>
        ) : (
          <div className="relative w-full">
            <label className="cursor-pointer" htmlFor="image_uploads">
              {previewImage ? (
                <div
                  className="relative mb-14 min-h-52 w-full rounded shadow-md shadow-gray-600 sm:min-h-60 lg:mb-16 lg:min-h-72 xl:min-h-[350px]"
                  style={{
                    backgroundImage: `url(${previewImage})`,
                    backgroundSize: "Cover",
                  }}
                >
                  <div className="absolute -bottom-16 left-0 flex w-2/6 min-w-44 items-center lg:-bottom-20 lg:min-w-52">
                    <img
                      src={data?.avatar?.secure_url}
                      width={400}
                      height={400}
                      className="m-5 aspect-square w-full max-w-72 rounded shadow-lg shadow-gray-500"
                    />
                  </div>
                  <div className="absolute left-2/4 top-2 -translate-x-2/4 rounded bg-gray-400 p-2 text-lg text-white">
                    Click to Change
                  </div>
                </div>
              ) : (
                <div
                  className="relative mb-14 min-h-52 w-full rounded shadow-md shadow-gray-600 sm:min-h-60 lg:mb-16 lg:min-h-72 xl:min-h-[350px]"
                  style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: "Cover",
                  }}
                >
                  <div className="absolute -bottom-16 left-0 flex w-2/6 min-w-44 items-center lg:-bottom-20 lg:min-w-52">
                    <img
                      src={data?.avatar?.secure_url}
                      width={400}
                      height={400}
                      className="m-5 aspect-square w-full max-w-72 rounded shadow-lg shadow-gray-500"
                    />
                  </div>
                  <div className="absolute left-2/4 top-2 -translate-x-2/4 rounded bg-gray-400 p-2 text-lg text-white">
                    Click Here
                  </div>
                </div>
              )}
            </label>
            <input
              onChange={getImage}
              className="hidden"
              type="file"
              id="image_uploads"
              name="image_uploads"
              accept=".jpg, .jpeg, .png, .webp"
            />
            <div
              className="glass absolute right-0 top-0 m-2 w-fit cursor-pointer rounded hover:bg-gray-200"
              onClick={() => setBgUpdating(true)}
            >
              <IoSave
                className="h-8 w-8 text-white hover:text-blue-600"
                onClick={() => bgImageHandler()}
              />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <div className="flex h-full flex-col items-center justify-center rounded xl:w-3/5">
            <h2 className="bold text-xl text-primary lg:px-5 lg:text-4xl">
              {data?.firstName + " " + data?.lastName}
            </h2>
            <p className="px-5 text-justify text-lg italic text-gray-700">
              {data?.bio}
            </p>
          </div>
          <div className="mt-3 flex flex-col px-5 xl:w-2/5 xl:px-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-lg font-semibold lg:text-xl ">Username :</h3>
              <p className="text-pretty text-lg text-primary">
                {data?.username}
              </p>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-lg font-semibold lg:text-xl ">Email :</h3>
              <p className="text-pretty text-lg text-primary">{data?.email}</p>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-lg font-semibold lg:text-xl ">Role :</h3>
              <p className="text-pretty text-lg uppercase text-primary">
                {data?.role}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button
            className="btn btn-primary text-gray-100"
            onClick={() => props.changePage(8)}
          >
            Edit Profile
          </button>
          <button
            className="btn btn-error text-gray-100"
            onClick={() => props.changePage(7)}
          >
            Close Account
          </button>
        </div>
      </div>
    </>
  );
};
export default Profile;
