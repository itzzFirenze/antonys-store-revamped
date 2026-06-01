import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { userListAction } from "../../Redux/Actions/User";
import { SpinnerLoading } from "../../components/Spinner";
import ViewWishlistModal from "./ViewWishlistModal";

// Truncate ID at first hyphen; fallback to first 8 chars for non-hyphenated IDs
const truncateId = (id = "") => {
   const hyphenIndex = id.indexOf("-");
   if (hyphenIndex !== -1) {
      return id.slice(0, hyphenIndex) + "...";
   }
   return id.length > 8 ? id.slice(0, 8) + "..." : id;
};

const CopyableId = ({ id }) => {
   const [copied, setCopied] = useState(false);

   const handleCopy = () => {
      navigator.clipboard.writeText(id).then(() => {
         setCopied(true);
         setTimeout(() => setCopied(false), 1500);
      });
   };

   return (
      <button
         onClick={handleCopy}
         title={id}
         className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer select-none"
      >
         {copied ? "Copied!" : truncateId(id)}
      </button>
   );
};

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
      const pageFromUrl = parseInt(params.get("page"));

      if (pageFromUrl && !isNaN(pageFromUrl)) {
         setCurrentPage(pageFromUrl);
      }

      dispatch(userListAction());
   }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

   // FIX: Memoize filtered list to avoid re-computing on every render
   const filteredUsers = useMemo(() => {
      return [...users]
         .reverse()
         .filter(
            (user) =>
               user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user._id?.toLowerCase().includes(searchTerm.toLowerCase())
         );
   }, [users, searchTerm]);

   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

   const updateUrlAndState = useCallback(
      (page) => {
         const validatedPage = Math.min(Math.max(1, page), totalPages || 1);
         const params = new URLSearchParams(location.search);
         params.set("page", validatedPage.toString());
         navigate(`?${params.toString()}`, { replace: true });
         setCurrentPage(validatedPage);
      },
      [navigate, totalPages, location.search]
   );

   // Reset page when searching
   useEffect(() => {
      if (searchTerm) {
         updateUrlAndState(1);
      }
   }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

   // Clamp current page if total pages shrinks
   useEffect(() => {
      if (totalPages > 0 && currentPage > totalPages) {
         updateUrlAndState(totalPages);
      }
   }, [totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

   const indexOfLastUser = currentPage * usersPerPage;
   const indexOfFirstUser = indexOfLastUser - usersPerPage;
   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

   // FIX: Safe "Showing X–Y of Z" for empty list
   const showingFrom = filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1;
   const showingTo = Math.min(indexOfLastUser, filteredUsers.length);

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

               {/* Search bar */}
               <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                  <div className="w-full md:w-1/2">
                     <div className="relative">
                        <svg
                           className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 pointer-events-none"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              fillRule="evenodd"
                              d="M10 2a8 8 0 016.32 12.906l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z"
                              clipRule="evenodd"
                           />
                        </svg>
                        <input
                           type="text"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-600 focus:border-blue-600 block w-full pl-9 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                           placeholder="Search by name, email, or ID..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                  </div>
               </div>

               {/* Table content */}
               {loading ? (
                  <div className="flex justify-center items-center min-h-[200px]">
                     <SpinnerLoading />
                  </div>
               ) : error ? (
                  <div className="text-red-500 p-4 text-center">{error}</div>
               ) : filteredUsers.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400 p-8 text-center">
                     No users found.
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                           <tr>
                              <th className="px-4 py-3">User ID</th>
                              <th className="px-4 py-3">Name</th>
                              <th className="px-4 py-3">Email</th>
                              <th className="px-4 py-3">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {currentUsers.map((user) => (
                              <tr
                                 key={user._id}
                                 className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                 {/* FIX: Truncated ID with tooltip + copy-on-click */}
                                 <td className="px-4 py-3">
                                    <CopyableId id={user._id} />
                                 </td>
                                 <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[11rem] truncate">
                                    {user.name}
                                 </td>
                                 <td className="px-4 py-3">{user.email}</td>
                                 <td className="px-4 py-3">
                                    <button
                                       onClick={() => handleViewWishlist(user._id)}
                                       className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1 rounded-lg transition-colors"
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

               {/* Pagination */}
               <nav
                  className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t dark:border-gray-700"
                  aria-label="Table navigation"
               >
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                     {/* FIX: Graceful empty state */}
                     Showing{" "}
                     <strong className="text-gray-900 dark:text-white">{showingFrom}–{showingTo}</strong>{" "}
                     of{" "}
                     <strong className="text-gray-900 dark:text-white">{filteredUsers.length}</strong>{" "}
                     users
                  </span>

                  {totalPages > 1 && (
                     <ul className="inline-flex items-center gap-1 text-sm">
                        <li>
                           <button
                              onClick={() => updateUrlAndState(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                           >
                              ← Prev
                           </button>
                        </li>

                        {/* FIX: Smart pagination with ellipsis for large page counts */}
                        {Array.from({ length: totalPages }).map((_, index) => {
                           const page = index + 1;
                           const isEdge = page === 1 || page === totalPages;
                           const isNearCurrent = Math.abs(page - currentPage) <= 1;
                           if (!isEdge && !isNearCurrent) {
                              if (page === 2 || page === totalPages - 1) {
                                 return (
                                    <li key={index}>
                                       <span className="px-2 py-1 text-gray-400">…</span>
                                    </li>
                                 );
                              }
                              return null;
                           }
                           return (
                              <li key={index}>
                                 <button
                                    onClick={() => updateUrlAndState(page)}
                                    className={`px-3 py-1 rounded border transition-colors ${currentPage === page
                                          ? "bg-blue-600 text-white border-blue-600"
                                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                       }`}
                                 >
                                    {page}
                                 </button>
                              </li>
                           );
                        })}

                        <li>
                           <button
                              onClick={() => updateUrlAndState(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                           >
                              Next →
                           </button>
                        </li>
                     </ul>
                  )}
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