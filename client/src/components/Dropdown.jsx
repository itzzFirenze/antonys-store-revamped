"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function UserDropdown({ logoutHandler }) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef(null);
   const userLoginReducer = useSelector((state) => state.userLoginReducer);
   const { userInfo } = userLoginReducer;
   const navigate = useNavigate();

   const handleDropdownToggle = () => setIsOpen((prev) => !prev);

   const handleDashboardRedirect = () => {
      if (userInfo) {
         navigate("/admin");
         setIsOpen(false);
      } else {
         navigate("/login");
      }
   };

   const handleUserProfileRedirect = () => {
      navigate("/user-profile");
      setIsOpen(false);
   };

   const handleWishlistRedirect = () => {
      navigate("/wishlist");
      setIsOpen(false);
   };

   const handleOrderRedirect = () => {
      navigate("/your-orders");
      setIsOpen(false);
   };

   const handleSignOut = async () => {
      setIsOpen(false);
      navigate("/", { replace: true });
      setTimeout(() => {
         logoutHandler();
      }, 0);
   };

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

   return (
      <div className="relative" ref={dropdownRef}>
         {/* Dropdown button */}
         <button
            onClick={handleDropdownToggle}
            className="flex items-center text-gray-200 bg-fuchsia-800 hover:bg-fuchsia-900 font-medium rounded-lg text-sm px-4 py-2"
         >
            <span className="mr-2">{userInfo?.name.split(" ")[0] || "Guest"}</span>

            <img
               src="/icons/down_arrow.svg"
               alt="arrow"
               className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'
                  }`}
            />
         </button>

         {/* Dropdown menu */}
         {isOpen && (
            <div className="absolute right-0 mt-2 w-48 
                          bg-white dark:bg-gray-800 
                          border border-gray-300 dark:border-gray-700 
                          rounded-lg shadow-lg z-50">
               <div className="p-3">
                  <span className="block text-xs text-gray-600 dark:text-gray-400 font-medium">Welcome</span>
                  <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                     {userInfo ? userInfo.name : "Guest"}
                  </span>
               </div>
               <div className="border-t border-gray-200 dark:border-gray-700"></div>
               {userInfo ? (
                  <>
                     {userInfo.isAdmin && (
                        <button
                           onClick={handleDashboardRedirect}
                           className="block w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2"
                        >
                           Dashboard
                        </button>
                     )}
                     {!userInfo.isAdmin && (
                        <button
                           onClick={handleUserProfileRedirect}
                           className="block w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2"
                        >
                           My Profile
                        </button>
                     )}
                     {!userInfo.isAdmin && (
                        <button
                           onClick={handleWishlistRedirect}
                           className="block w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2"
                        >
                           Wishlist
                        </button>
                     )}
                     {!userInfo.isAdmin && (
                        <button
                           onClick={handleOrderRedirect}
                           className="block w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2"
                        >
                           Orders
                        </button>
                     )}
                     <div className="border-t border-gray-200 dark:border-gray-700"></div>
                     <button
                        onClick={handleSignOut}
                        className="block w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:rounded-md dark:hover:bg-gray-700 px-4 py-2"
                     >
                        Sign out
                     </button>
                  </>
               ) : (
                  <button
                     onClick={() => {
                        navigate("/login");
                        setIsOpen(false);
                     }}
                     className="block w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2"
                  >
                     Log in
                  </button>
               )}
            </div>
         )}
      </div>
   );
}