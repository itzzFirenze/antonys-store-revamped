import { useDispatch, useSelector } from "react-redux";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { UserDropdown } from "../components/Dropdown";
import { userLogoutAction } from "../Redux/Actions/User";
import { useState } from "react";
import 'hamburgers/dist/hamburgers.min.css';

const hamburgerStyles = `
.hamburger {
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hamburger-box {
  width: 24px;
  height: 16px;
  display: flex;
  align-items: center;
}

.hamburger-inner,
.hamburger-inner::before,
.hamburger-inner::after {
  width: 24px;
  height: 2px;
}

.hamburger-inner::before {
  top: -7px;
}

.hamburger-inner::after {
  bottom: -7px;
}

@media (min-width: 768px) {
  .hamburger {
    display: none !important;
  }
}
`;

const Navbar = () => {
   const userLoginReducer = useSelector((state) => state.userLoginReducer);
   const { userInfo } = userLoginReducer;
   const dispatch = useDispatch();
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const navigate = useNavigate();
   const location = useLocation();

   const logoutHandler = () => {
      dispatch(userLogoutAction());
      navigate("/");
   };

   const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
   };

   return (
      <>
         <style>{hamburgerStyles}</style>
         <div className="fixed top-0 left-0 right-0 z-50">
            <nav className="mx-4 my-2 rounded-xl bg-white/40 backdrop-blur-md border shadow-lg dark:bg-gray-900/70 border-none">
               <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
                  <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                     <img src="/icons/new-logo-1.png" className="h-12 w-24" alt="antonys Logo" />
                  </a>
                  <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse items-center">
                     {!userInfo ? (
                        <Link
                           to="/login"
                           className="text-gray-100 bg-fuchsia-800 hover:bg-fuchsia-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-1.5 text-center dark:bg-fuchsia-800 dark:hover:bg-fuchsia-900 dark:focus:ring-fuchsia-900"
                        >
                           Login / SignUp
                        </Link>
                     ) : (
                        <UserDropdown logoutHandler={logoutHandler} />
                     )}

                     <button
                        onClick={toggleMenu}
                        className={`hamburger hamburger--spin ${isMenuOpen ? 'is-active' : ''}`}
                        type="button"
                        aria-controls="navbar-menu"
                        aria-expanded={isMenuOpen}
                     >
                        <span className="hamburger-box">
                           <span className="hamburger-inner"></span>
                        </span>
                     </button>
                  </div>
                  <div
                     className={`
                        overflow-hidden transition-max-height duration-500 ease-in-out
                        ${isMenuOpen ? "max-h-96" : "max-h-0"} 
                        items-center justify-between w-full md:flex md:max-h-full md:w-auto md:order-1
                     `}
                     id="navbar-menu"
                  >
                     <ul className="flex flex-col font-medium p-2 md:p-0 mt-2 md:space-x-4 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
                        <li className="w-full md:w-auto">
                           <NavLink
                              to="/"
                              onClick={() => setIsMenuOpen(false)}
                              className={({ isActive }) =>
                                 `block w-full md:w-auto text-center transition-all duration-300 ease-in-out
                                 md:rounded-full md:inline-block
                                 ${isActive 
                                    ? "text-white bg-pink-600 px-5 py-1.5 rounded-2xl" 
                                    : "text-gray-800 hover:bg-pink-100 dark:text-gray-200 dark:hover:bg-pink-900/30 px-5 py-1.5"
                                 }`
                              }
                           >
                              Home
                           </NavLink>
                        </li>
                        <li className="w-full md:w-auto">
                           <NavLink
                              to="/shop"
                              onClick={() => setIsMenuOpen(false)}
                              className={({ isActive }) =>
                                 `block w-full md:w-auto text-center transition-all duration-300 ease-in-out
                                 md:rounded-full md:inline-block
                                 ${isActive 
                                    ? "text-white bg-pink-600 px-5 py-1.5 rounded-2xl" 
                                    : "text-gray-800 hover:bg-pink-100 dark:text-gray-200 dark:hover:bg-pink-900/30 px-5 py-1.5"
                                 }`
                              }
                           >
                              Shop
                           </NavLink>
                        </li>
                        <li className="w-full md:w-auto">
                           <NavLink
                              to="/about"
                              onClick={() => setIsMenuOpen(false)}
                              className={({ isActive }) =>
                                 `block w-full md:w-auto text-center transition-all duration-300 ease-in-out
                                 md:rounded-full md:inline-block
                                 ${isActive 
                                    ? "text-white bg-pink-600 px-5 py-1.5 rounded-2xl" 
                                    : "text-gray-800 hover:bg-pink-100 dark:text-gray-200 dark:hover:bg-pink-900/30 px-5 py-1.5"
                                 }`
                              }
                           >
                              About
                           </NavLink>
                        </li>
                        <li className="w-full md:w-auto">
                           <NavLink
                              to="/contactus"
                              onClick={() => setIsMenuOpen(false)}
                              className={({ isActive }) =>
                                 `block w-full md:w-auto text-center transition-all duration-300 ease-in-out
                                 md:rounded-full md:inline-block
                                 ${isActive 
                                    ? "text-white bg-pink-600 px-5 py-1.5 rounded-2xl" 
                                    : "text-gray-800 hover:bg-pink-100 dark:text-gray-200 dark:hover:bg-pink-900/30 px-5 py-1.5"
                                 }`
                              }
                           >
                              Contact Us
                           </NavLink>
                        </li>
                     </ul>
                  </div>
               </div>
            </nav>
         </div>
      </>
   );
};

export default Navbar;