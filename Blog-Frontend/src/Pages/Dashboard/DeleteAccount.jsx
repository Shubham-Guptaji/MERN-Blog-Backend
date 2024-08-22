import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteAccount } from "../../Redux/authSlice";

// Component to handle account deletion
const DeleteAccount = ({}) => {
  // Get the user ID from the Redux store
  const userId = useSelector(state => state?.auth?.data?.id);
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState(false);
  // Get the user's first name from the Redux store
  const firstName = useSelector(state => state?.auth?.data?.firstName);

  // Handler function to delete the account
  const deleteHandler = async () => {
    // Only delete the account if the checkbox is checked
    if (isChecked) {
      await dispatch(deleteAccount({ id: userId }));
    }
  }
  
    return (
        <> 
            <h1 className="mb-7 text-2xl font-semibold text-primary lg:text-3xl">
                Delete Your Account
            </h1>
            <p className="mb-5 text-base text-justify">Hi <strong>{firstName}</strong>,</p>
            <p className="mb-5 text-base text-justify">We are Sorry to hear you'd like to remove your account.</p>
            <p className="mb-8 text-base text-justify">Once the deletion process has begun, you won't be able to reactivate your account or retrieve any of the content, posts and information you have added.</p>
            <hr className="border-t border-black"/>
            <p className="my-5 text-base text-justify">If you have any concern with your privacy, you may read our <Link to={"/privacy-policy"} className="link-primary">Privacy Policy</Link>.</p>
            <p className="mb-5 text-base text-justify">You can also reach out to us through following ways :</p>
            <ul className="list-disc list-inside mb-5">
                <li>
                    <Link to={"/contact"} className="link-primary">Contact Us</Link>
                </li>
                <li>
                    Email : <a href="mailto:support@alcodemy.tech" className="link-primary">support@alcodemy.tech</a>
                </li>
            </ul>
            <p className="mb-8 text-base text-justify">
                <input type="checkbox" name="delete" id="delete" onChange={() => setIsChecked(!isChecked)} checked={isChecked} className="me-1 checkbox checkbox-xs translate-y-1 rounded checkbox-primary"/> I have read the privacy policy and agree that all my content and information including my profile, posts, likes, follows and comments will be removed and will not be recovered. 
            </p>
            <button className={`btn btn-error ${!isChecked && "btn-disabled"}`} onClick={() => deleteHandler()}>Delete Account</button>

        </>
    )
}

export default DeleteAccount;