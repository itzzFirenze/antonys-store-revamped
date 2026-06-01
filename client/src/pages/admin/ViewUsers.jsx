import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { userListAction, toggleAdminAction } from "../../Redux/Actions/User";
import SpinnerLoading from "../../components/Spinner";
import FilterDropdown from "../../components/filterDropdown";
import DeleteUserModal from "./DeleteUserModal";

// Truncate MongoDB ObjectID to the part before the first hyphen + ellipsis
// MongoDB ObjectIDs don't have hyphens, but if using UUID-style IDs this works perfectly.
// For plain ObjectIDs (24 hex chars), we show first 8 chars + "..."
const truncateId = (id = "") => {
   const hyphenIndex = id.indexOf("-");
   if (hyphenIndex !== -1) {
      return id.slice(0, hyphenIndex) + "...";
   }
   // Fallback for non-hyphenated IDs (e.g. MongoDB ObjectID): show first 8 chars
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

const ViewUsers = () => {
   const dispatch = useDispatch();
   const location = useLocation();
   const navigate = useNavigate();
   const userList = useSelector((state) => state.userListReducer || {});
   const { loading, error, users = [] } = userList;
   const userLoginReducer = useSelector((state) => state.userLoginReducer || {});
   const { userInfo } = userLoginReducer;

   const [searchTerm, setSearchTerm] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [filterStatus, setFilterStatus] = useState("all");
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedUser, setSelectedUser] = useState(null);
   // FIX: Track whether the initial URL params have been applied
   const [isInitialLoad, setIsInitialLoad] = useState(true);

   const usersPerPage = 10;

   // Initialize from URL on component mount
   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get("page"));
      const filterFromUrl = params.get("filter");

      if (pageFromUrl && !isNaN(pageFromUrl)) {
         setCurrentPage(pageFromUrl);
      }
      if (filterFromUrl) {
         setFilterStatus(filterFromUrl);
      }

      dispatch(userListAction());
      // FIX: Mark initial load as done so subsequent filter changes update the URL
      setIsInitialLoad(false);
   }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

   const filteredUsers = useMemo(() => {
      return users
         .filter(
            (user) =>
               user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user._id?.toLowerCase().includes(searchTerm.toLowerCase())
         )
         .filter((user) => {
            if (filterStatus === "admin") return user.isAdmin;
            if (filterStatus === "user") return !user.isAdmin;
            return true;
         })
         .reverse();
   }, [users, searchTerm, filterStatus]);

   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

   const updateUrlAndState = useCallback(
      (page, filter) => {
         const validatedPage = Math.min(Math.max(1, page), totalPages || 1);
         const params = new URLSearchParams(location.search);
         params.set("page", validatedPage.toString());
         if (filter !== "all") {
            params.set("filter", filter);
         } else {
            params.delete("filter");
         }
         navigate(`?${params.toString()}`, { replace: true });
         setCurrentPage(validatedPage);
         setFilterStatus(filter);
      },
      [navigate, totalPages, location.search]
   );

   // Reset page to 1 when searching
   useEffect(() => {
      if (searchTerm) {
         updateUrlAndState(1, filterStatus);
      }
   }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

   // Update URL when filter changes (skip on initial load)
   useEffect(() => {
      if (!isInitialLoad) {
         updateUrlAndState(1, filterStatus);
      }
   }, [filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

   // Clamp current page if total pages shrinks
   useEffect(() => {
      if (totalPages > 0 && currentPage > totalPages) {
         updateUrlAndState(totalPages, filterStatus);
      }
   }, [totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

   const indexOfLastUser = currentPage * usersPerPage;
   const indexOfFirstUser = indexOfLastUser - usersPerPage;
   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

   const paginate = (pageNumber) => updateUrlAndState(pageNumber, filterStatus);

   const openDeleteModal = (user) => {
      setSelectedUser(user);
      setIsModalOpen(true);
   };

   const closeDeleteModal = () => {
      setIsModalOpen(false);
      setSelectedUser(null);
   };

   const handleToggleAdmin = (userId, isAdmin) => {
      dispatch(toggleAdminAction(userId, !isAdmin));
   };

   // FIX: Safe display for "Showing X-Y of Z" when list is empty
   const showingFrom = filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1;
   const showingTo = Math.min(indexOfLastUser, filteredUsers.length);

   return (
      <>
         <DeleteUserModal
            isOpen={isModalOpen}
            closeModal={closeDeleteModal}
            user={selectedUser}
         />
         <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
               <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                  {/* Search + Filter bar */}
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                     <div className="w-full md:w-1/2">
                        <input
                           type="text"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-600 focus:border-blue-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                           placeholder="Search by name, email, or ID..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <FilterDropdown
                        filterStatus={filterStatus}
                        setFilterStatus={(val) => setFilterStatus(val)}
                     />
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
                        <table className="w-full text-sm text-gray-500 dark:text-gray-400 text-left">
                           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                              <tr>
                                 <th className="px-4 py-3">User ID</th>
                                 <th className="px-4 py-3">Name</th>
                                 <th className="px-4 py-3">Email</th>
                                 <th className="px-4 py-3">Status</th>
                                 <th className="px-4 py-3">Created At</th>
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
                                    <td className="px-4 py-3 max-w-[11rem] truncate font-medium text-gray-900 dark:text-white">
                                       {user.name}
                                    </td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">
                                       <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${user.isAdmin
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                                             }`}
                                       >
                                          {user.isAdmin ? "Admin" : "User"}
                                       </span>
                                    </td>
                                    <td className="px-4 py-3">
                                       {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                       {userInfo?._id !== user._id ? (
                                          <div className="flex items-center gap-2">
                                             {/* Toggle Admin button */}
                                             <button
                                                onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium text-white w-28 text-center transition-colors ${user.isAdmin
                                                      ? "bg-red-600 hover:bg-red-700"
                                                      : "bg-blue-600 hover:bg-blue-700"
                                                   }`}
                                             >
                                                {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                                             </button>

                                             {/* FIX: Delete button — disabled state is visually distinct, not red */}
                                             <button
                                                onClick={() => !user.isAdmin && openDeleteModal(user)}
                                                disabled={user.isAdmin}
                                                title={user.isAdmin ? "Revoke admin before deleting" : "Delete user"}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium text-white transition-colors ${user.isAdmin
                                                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-60"
                                                      : "bg-red-600 hover:bg-red-700"
                                                   }`}
                                             >
                                                Delete
                                             </button>
                                          </div>
                                       ) : (
                                          <span className="text-xs text-gray-400 italic">You</span>
                                       )}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}

                  {/* Pagination */}
                  <nav className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t dark:border-gray-700">
                     <span className="text-sm text-gray-500 dark:text-gray-400">
                        {/* FIX: Handles empty list gracefully */}
                        Showing <strong className="text-gray-900 dark:text-white">{showingFrom}–{showingTo}</strong> of{" "}
                        <strong className="text-gray-900 dark:text-white">{filteredUsers.length}</strong> users
                     </span>

                     {totalPages > 1 && (
                        <ul className="inline-flex items-center gap-1 text-sm">
                           <li>
                              <button
                                 onClick={() => paginate(currentPage - 1)}
                                 disabled={currentPage === 1}
                                 className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                 ← Prev
                              </button>
                           </li>

                           {Array.from({ length: totalPages }).map((_, index) => {
                              const page = index + 1;
                              // Show first, last, current ±1, and ellipsis for long ranges
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
                                       onClick={() => paginate(page)}
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
                                 onClick={() => paginate(currentPage + 1)}
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
         </section>
      </>
   );
};

export default ViewUsers;