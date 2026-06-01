import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { userListAction } from "../../Redux/Actions/User";
import { SpinnerLoading } from "../../components/Spinner";
import ViewWishlistModal from "./ViewWishlistModal";

const ViewUsersWishlist = () => {
   const dispatch = useDispatch();
   const location = useLocation();
   const navigate = useNavigate();
   const userList = useSelector((state) => state.userListReducer || {});
   const { loading, error, users = [] } = userList;

   const [searchTerm, setSearchTerm] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
   const [selectedUserId, setSelectedUserId] = useState(null);
   const usersPerPage = 10;

   // Initialize from URL and fetch data on mount
   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get('page'));
      
      if (pageFromUrl && !isNaN(pageFromUrl)) {
         setCurrentPage(pageFromUrl);
      }
      
      dispatch(userListAction());
   }, [dispatch, location.search]);

   const filteredUsers = [...users]
      .reverse()
      .filter((user) =>
         user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );

   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

   // Handle page navigation
   const updateUrlAndState = useCallback((page) => {
      const validatedPage = Math.min(Math.max(1, page), totalPages || 1);
      const params = new URLSearchParams(location.search);
      params.set('page', validatedPage.toString());
      navigate(`?${params.toString()}`, { replace: true });
      setCurrentPage(validatedPage);
   }, [navigate, totalPages, location.search]);

   // Reset page when searching
   useEffect(() => {
      if (searchTerm) {
         updateUrlAndState(1);
      }
   }, [searchTerm, updateUrlAndState]);

   // Validate current page when total pages changes
   useEffect(() => {
      if (totalPages > 0 && currentPage > totalPages) {
         updateUrlAndState(Math.min(currentPage, totalPages));
      }
   }, [totalPages, currentPage, updateUrlAndState]);

   const indexOfLastUser = currentPage * usersPerPage;
   const indexOfFirstUser = indexOfLastUser - usersPerPage;
   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

   const paginate = (pageNumber) => {
      updateUrlAndState(pageNumber);
   };

   const handleViewWishlist = (userId) => {
      setSelectedUserId(userId);
      setIsWishlistModalOpen(true);
   };

   const closeWishlistModal = () => {
      setIsWishlistModalOpen(false);
      setSelectedUserId(null);
   };

   return (
      <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
         <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
               <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                  <div className="w-full md:w-1/2">
                     <form className="flex items-center relative">
                        <svg
                           className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-300"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              fillRule="evenodd"
                              d="M10 2a8 8 0 016.32 12.906l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z"
                              clipRule="evenodd"
                           ></path>
                        </svg>
                        <input
                           type="text"
                           className="bg-gray-50 border text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                           placeholder="Search users..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </form>
                  </div>
               </div>

               {loading ? (
                  <SpinnerLoading />
               ) : error ? (
                  <div className="text-red-500 p-4">{error}</div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                           <tr>
                              <th className="px-4 py-3">User ID</th>
                              <th className="px-4 py-3">Name</th>
                              <th className="px-4 py-3">Email</th>
                              <th className="px-4 py-3">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {currentUsers.map((user) => (
                              <tr key={user._id} className="border-b dark:border-gray-700">
                                 <td className="px-4 py-3">{user._id}</td>
                                 <td className="px-4 py-3">{user.name}</td>
                                 <td className="px-4 py-3">{user.email}</td>
                                 <td className="px-4 py-3">
                                    <button
                                       onClick={() => handleViewWishlist(user._id)}
                                       className="bg-blue-600 hover:bg-blue-700 text-gray-100 px-3 py-1 rounded-lg"
                                    >
                                       View Wishlist
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}

               <nav className="flex justify-between items-center p-4" aria-label="Table navigation">
                  <span>
                     Showing{" "}
                     <strong>
                        {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)}
                     </strong>{" "}
                     of <strong>{filteredUsers.length}</strong>
                  </span>
                  <ul className="inline-flex items-center">
                     <li>
                        <button
                           onClick={() => paginate(currentPage - 1)}
                           disabled={currentPage === 1}
                           className="px-3 py-1 disabled:opacity-50"
                        >
                           Previous
                        </button>
                     </li>
                     {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }).map((_, index) => (
                        <li key={index}>
                           <button
                              onClick={() => paginate(index + 1)}
                              className={`px-3 py-1 ${currentPage === index + 1 ? "bg-blue-600 text-gray-100" : ""}`}
                           >
                              {index + 1}
                           </button>
                        </li>
                     ))}
                     <li>
                        <button
                           onClick={() => paginate(currentPage + 1)}
                           disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
                           className="px-3 py-1 disabled:opacity-50"
                        >
                           Next
                        </button>
                     </li>
                  </ul>
               </nav>
            </div>
         </div>
         <ViewWishlistModal
            isOpen={isWishlistModalOpen}
            closeModal={closeWishlistModal}
            userId={selectedUserId}
         />
      </section>
   );
};

export default ViewUsersWishlist;