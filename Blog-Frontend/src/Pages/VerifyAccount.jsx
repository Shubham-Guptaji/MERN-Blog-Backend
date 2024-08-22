import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

// Importing images for different verification states
import NotVerifiedImg from "../assets/denied-mail.svg";
import VerifiedImg from "../assets/undraw_Happy_news_re_tsbd.png";
import VerifyImg from "../assets/VerifyingAcc.svg";
import Layout from "../Layout/Layout";
import { logout, VerifyTokenAccount } from "../Redux/authSlice";

const VerifyAccount = () => {
  // Getting username and token from URL parameters
  const { username, token } = useParams();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(null);
  const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
  const dispatch = useDispatch();

  // Determining which image to display based on verification state
  let img;
  if (verified === true) img = VerifiedImg;
  else if (verified === false) img = NotVerifiedImg;
  else img = VerifyImg;

  // Function to verify account token
  const verifyfn = async (data) => {
    // Dispatching VerifyTokenAccount action with username and token
    const res = await dispatch(VerifyTokenAccount(data));
    if (res?.payload?.success) {
      // If verification is successful, set verified to true and logout if already logged in
      setVerified(true);
      if (isLoggedIn) await dispatch(logout());
    } else {
      // If verification fails, set verified to false
      setVerified(false);
    }
    
    // Redirect to sign-in page after 4 seconds
    setTimeout(() => navigate("/sign-in"), 4000);
  };

  // Verifying account token on component mount
  useEffect(() => {
    if (username && token) verifyfn({ username, token });
  }, []);

  return (
    <Layout>
      <div className="bg-slate-200">
        <div
          className="mx-auto my-10 flex max-w-lg flex-col items-start justify-center xl:my-16 xl:min-h-[80vh] 2xl:my-16"
        >
          <div
            className={`mx-auto mt-3 flex max-w-md flex-col rounded-xl bg-white px-4 py-12 shadow sm:px-8 lg:px-12 ${verified === true ? "shadow-md shadow-green-500" : verified === false ? "shadow-md shadow-red-500" : "text-slate-500"}`}
          >
            <img src={img} className="mx-auto my-3 sm:w-10/12" />

            <h1 className="mt-5 text-center text-xl font-bold">
              Hello {username},
            </h1>
            <br />
            <p
              className={`text-center font-bold text-lg ${verified === true ? "text-green-500" : verified === false ? "text-red-500" : "text-slate-500"}`}
            >
              {
                verified === true
                  ? "Your account has been verified successfully."
                  : verified === false
                  ? "Your account verification has failed."
                  : "Please wait while we verify your account"
              }
            </p>
            <p className="mb-4 mt-2 text-center text-slate-500">
              {
                verified === null
                  ? "Almost there! Just a moment"
                  : "You will be redirected in 4 seconds."
              }
            </p>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyAccount;