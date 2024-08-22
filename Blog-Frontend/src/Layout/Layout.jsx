import { useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom"; // Import Link for proper navigation

import { logout } from "../Redux/authSlice"

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    // Scroll to the top on page render
    window.scrollTo(0, 0);
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  let isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  // let authId = useSelector(state => state?.auth?.data?.id);
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Navigation items for the header and footer
  const navigationItems = [
    { name: "Home", to: "/" },
    { name: "All Posts", to: "/posts" },
    { name: "Contact", to: "/contact" },
  ];
  const date = new Date();
  const year = date.getFullYear();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout functionality
  const logouthandler = async () => {
    const res = await dispatch(logout());
    if(res?.payload?.success) navigate("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col ">
      <nav className="sticky top-0 z-20 w-full bg-indigo-600">
        <div className="container mx-auto  items-center justify-between px-3 text-white md:w-10/12">
          <div className="flex w-full items-center justify-between py-2">
            {/* Logo */}
            <div className="flex items-center ">
              <span className="mr-2 text-2xl font-bold">Alcodemy Blog</span>
            </div>

            {/* Navigation links (desktop) */}
            <ul className="hidden items-center space-x-3 lg:space-x-5 font-serif text-xl md:flex ">
              {navigationItems.map((item) => (
                <li key={item.name} className="text-base-200 hover:text-white">
                  <Link to={item.to} className="font-medium">
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className="text-base-200 hover:text-white cursor-pointer">
                {isLoggedIn ? (
                  // <span onClick={logouthandler}>Logout</span>
                  <>
                  <button  onClick={()=>document.getElementById('my_modal_1').showModal()}>Logout</button>
                  {/* <button  onClick={()=>setIsLoggingOut(true)}>Logout</button> */}
                  <dialog id="my_modal_1" className="modal">
                    <div className="modal-box">
                      <h3 className="font-bold text-lg text-indigo-700">Confirm Logout</h3>
                      <p className="py-4 text-black">Are you sure you want to logout from your account now?</p>
                      <div className="modal-action">
                        <button className="btn" onClick={logouthandler}>Confirm</button>
                        <form method="dialog">
                          <button className="btn">Close</button>
                        </form>
                      </div>
                    </div>
                  </dialog>

                  
                  

                  </>
                ) : (
                  <Link to="/sign-in">Sign In</Link>
                )}
              </li>
              <li className="m-0 cursor-pointer rounded bg-red-500 p-2 pb-1 pt-1 text-white ring-1 ring-red-600 hover:bg-red-600 hover:ring-red-700">
                {isLoggedIn ? (
                  <Link to="/dashboard">Dashboard</Link>
                ) : (
                  <Link to="/sign-up">Sign Up</Link>
                )}
              </li>
            </ul>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="flex focus:outline-none md:hidden "
            >
              {isOpen ? (
                <AiOutlineClose size={24} />
              ) : (
                <AiOutlineMenu size={24} />
              )}
            </button>
          </div>

          {/* Mobile menu (toggles on click) */}
          <ul
            className={`w-full transform pb-2 transition duration-300 ease-in-out md:hidden ${
              isOpen ? "block translate-y-0" : "hidden -translate-y-full"
            }`}
          >
            {navigationItems.map((item) => (
              <li
                key={item.name}
                className="block px-4 py-0.5 font-serif text-base-200 hover:text-white"
              >
                <Link
                  to={item.to}
                  className="block text-lg font-medium text-white"
                  onClick={toggleMenu}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li className="block px-4 py-0.5 font-serif text-base-200 hover:text-white">
              {isLoggedIn ? (
                <>
                <button  onClick={()=>document.getElementById('my_modal_2').showModal()} className="text-lg font-medium text-white">Logout</button> 
                <dialog id="my_modal_2" className="modal">
                  <div className="modal-box">
                    <h3 className="font-bold text-lg text-indigo-700">Confirm Logout</h3>
                    <p className="py-4 text-black">Are you sure you want to logout from your account now?</p>
                    <div className="modal-action">
                      <button className="btn" onClick={logouthandler}>Confirm</button>
                      <form method="dialog">
                        <button className="btn">Close</button>
                      </form>
                    </div>
                  </div>
                </dialog> </>
              ) : (
                <Link
                  to="/sign-in"
                  className="block text-lg font-medium text-white"
                  onClick={toggleMenu }
                >
                  Sign In
                </Link>
              )}
            </li>
            <li className="block px-4 py-0.5 font-serif text-base-200 hover:text-white">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="block text-lg font-medium text-white"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/sign-up"
                  className="block text-lg font-medium text-white"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              )}
            </li>
          </ul>
        </div>
      </nav>
      {children}
      <footer className="relative bottom-0 mt-auto w-full bg-indigo-600">
        <div className="container footer mx-auto items-center p-10 px-3 text-neutral-content md:w-10/12">
          <aside>
            <p className="text-3xl font-bold">Alcodemy</p>
          </aside>
          <nav>
            <h6 className="footer-title text-lg opacity-90">Navigation</h6>
            <div className="grid gap-4 md:grid-flow-col">
              {navigationItems.map((item) => (
                <li key={item.name} className="list-none hover:text-white">
                  <Link to={item.to} className="font-medium">
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className="list-none hover:text-white">
                <Link to={"/about"} className="font-medium">
                  About
                </Link>
              </li>
              <li className="list-none hover:text-white">
                <Link to={"/privacy-policy"} className="font-medium">
                  Privacy Policy
                </Link>
              </li>
            </div>
          </nav>
        </div>
        <hr />
        <div className="container footer footer-center mx-auto items-center px-3 pb-3 pt-3 text-neutral-content md:w-10/12">
          <aside>
            <p>Copyright © {year} - All right reserved by Alcodemy Blog</p>
          </aside>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
