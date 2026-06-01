import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Layout from "../../layouts/Layouts";
import { useDispatch } from "react-redux";
import { userLogoutAction } from "../../Redux/Actions/User";
import AdminDashboard from "./AdminDashboard";

const Admin = () => {
   const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
   const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
   const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);
   const [refreshFlag, setRefreshFlag] = useState(false);
   const dispatch = useDispatch();
   const location = useLocation();

   const toggleProductsDropdown = () => setIsProductsDropdownOpen(!isProductsDropdownOpen);
   const toggleUsersDropdown = () => setIsUsersDropdownOpen(!isUsersDropdownOpen);
   const toggleOrdersDropdown = () => setIsOrdersDropdownOpen(!isOrdersDropdownOpen);

   const refreshProducts = () => {
      setRefreshFlag((prev) => !prev);
   };

   const isMainDashboard = location.pathname === '/admin';

   return (
      <Layout showNavbarAndFooter={false}>
         <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 h-full bg-white border-r border-gray-200 fixed top-0 left-0">
               <div className="flex flex-col h-full">
                  <div className="flex flex-col justify-between py-5 px-3 h-full">
                     <ul className="space-y-2 mt-5">
                        {/* Products Dropdown */}
                        <li className={`bg-gray-100 rounded-lg overflow-hidden ${isProductsDropdownOpen ? 'pb-2' : ''}`}>
                           <button
                              onClick={toggleProductsDropdown}
                              className="flex items-center p-2 w-full text-base font-normal text-gray-900 transition duration-75 group hover:bg-gray-200"
                           >
                              <img src="/icons/features.png" alt="Products" className="w-5 h-5 text-gray-500" />
                              <span className="flex-1 ml-3 text-left whitespace-nowrap">Products</span>
                              <img
                                 src="/icons/up-arrow.png"
                                 alt="Arrow"
                                 className={`w-4 h-4 transition-transform duration-300 ${isProductsDropdownOpen ? 'rotate-180' : ''}`}
                              />
                           </button>
                           <div className={`${isProductsDropdownOpen ? "block" : "hidden"}`}>
                              <div className="mx-4 my-2 border-t border-gray-300"></div>
                              <ul className="space-y-2">
                                 <li>
                                    <Link to="/admin/view-products" className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 transition duration-75 group hover:bg-gray-200">
                                       View Products
                                    </Link>
                                 </li>
                              </ul>
                           </div>
                        </li>

                        {/* Users Dropdown */}
                        <li className={`bg-gray-100 rounded-lg overflow-hidden ${isUsersDropdownOpen ? 'pb-2' : ''}`}>
                           <button
                              onClick={toggleUsersDropdown}
                              className="flex items-center p-2 w-full text-base font-normal text-gray-900 transition duration-75 group hover:bg-gray-200"
                           >
                              <img src="/icons/group.png" alt="Users" className="w-5 h-5 text-gray-500" />
                              <span className="flex-1 ml-3 text-left whitespace-nowrap">Users</span>
                              <img
                                 src="/icons/up-arrow.png"
                                 alt="Arrow"
                                 className={`w-4 h-4 transition-transform duration-300 ${isUsersDropdownOpen ? 'rotate-180' : ''}`}
                              />
                           </button>
                           <div className={`${isUsersDropdownOpen ? "block" : "hidden"}`}>
                              <div className="mx-4 my-2 border-t border-gray-300"></div>
                              <ul className="space-y-2">
                                 <li>
                                    <Link to="/admin/view-users" className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 transition duration-75 group hover:bg-gray-200">
                                       View Users
                                    </Link>
                                 </li>
                                 <li>
                                    <Link to="/admin/view-users-wishlist" className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 transition duration-75 group hover:bg-gray-200">
                                       Users Wishlist
                                    </Link>
                                 </li>
                              </ul>
                           </div>
                        </li>

                        {/* Orders Dropdown */}
                        <li className={`bg-gray-100 rounded-lg overflow-hidden ${isOrdersDropdownOpen ? 'pb-2' : ''}`}>
                           <button
                              onClick={toggleOrdersDropdown}
                              className="flex items-center p-2 w-full text-base font-normal text-gray-900 transition duration-75 group hover:bg-gray-200"
                           >
                              <img src="/icons/order-delivery.png" alt="Orders" className="w-5 h-5 text-gray-500" />
                              <span className="flex-1 ml-3 text-left whitespace-nowrap">Orders</span>
                              <img
                                 src="/icons/up-arrow.png"
                                 alt="Arrow"
                                 className={`w-4 h-4 transition-transform duration-300 ${isOrdersDropdownOpen ? 'rotate-180' : ''}`}
                              />
                           </button>
                           <div className={`${isOrdersDropdownOpen ? "block" : "hidden"}`}>
                              <div className="mx-4 my-2 border-t border-gray-300"></div>
                              <ul className="space-y-2">
                                 <li>
                                    <Link to="/admin/view-orders" className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 transition duration-75 group hover:bg-gray-200">
                                       View Orders
                                    </Link>
                                 </li>
                                 <li>
                                    <Link to="/admin/view-approved-orders" className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 transition duration-75 group hover:bg-gray-200">
                                       Approved Orders
                                    </Link>
                                 </li>
                              </ul>
                           </div>
                        </li>
                     </ul>

                     <div className="mt-auto">
                        <ul className="space-y-2">
                           <li>
                              <Link to="/admin" className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-200 bg-gray-100">
                                 <img src="/icons/dashboard.png" alt="Home" className="w-6 h-6 object-contain flex-shrink-0" />
                                 <span className="ml-3">Dashboard</span>
                              </Link>
                           </li>
                           <li>
                              <Link to="/" className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-200 bg-gray-100">
                                 <img src="/icons/new-home.png" alt="Home" className="w-6 h-6 object-contain flex-shrink-0" />
                                 <span className="ml-3">Home</span>
                              </Link>
                           </li>
                           <li>
                              <button
                                 onClick={() => dispatch(userLogoutAction())}
                                 className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-200 bg-gray-100"
                              >
                                 <img src="/icons/exit.png" alt="Logout" className="w-6 h-6 object-contain flex-shrink-0" />
                                 <span className="ml-3">Logout</span>
                              </button>
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 h-screen ml-64 overflow-y-auto">
               {isMainDashboard ? (
                  <div className="p-4">
                     <AdminDashboard />
                  </div>
               ) : (
                  <Outlet context={{ refreshProducts, refreshFlag }} />
               )}
            </main>
         </div>
      </Layout>
   );
};

export default Admin;