import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { userListAction, toggleAdminAction } from "../../Redux/Actions/User";
import SpinnerLoading from "../../components/Spinner";
import FilterDropdown from "../../components/filterDropdown";
import DeleteUserModal from "./DeleteUserModal";

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
   const [isInitialLoad, setIsInitialLoad] = useState(true);

   const usersPerPage = 10;

   // Initialize from URL on component mount
   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get('page'));
      const filterFromUrl = params.get('filter');
      
      if (pageFromUrl && !isNaN(pageFromUrl)) {
         setCurrentPage(pageFromUrl);
      }
      if (filterFromUrl) {
         setFilterStatus(filterFromUrl);
      }
      
      dispatch(userListAction());
   }, [dispatch, location.search]);

   const filteredUsers = useMemo(() => {
      return users
         .filter((user) =>
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

   // Handle page and filter navigation
   const updateUrlAndState = useCallback((page, filter) => {
      const validatedPage = Math.min(Math.max(1, page), totalPages || 1);
      const params = new URLSearchParams(location.search);
      params.set('page', validatedPage.toString());
      if (filter !== "all") {
         params.set('filter', filter);
      } else {
         params.delete('filter');
      }
      navigate(`?${params.toString()}`, { replace: true });
      setCurrentPage(validatedPage);
      setFilterStatus(filter);
   }, [navigate, totalPages, location.search]);

   // Reset page when searching
   useEffect(() => {
      if (searchTerm) {
         updateUrlAndState(1, filterStatus);
      }
   }, [searchTerm, filterStatus, updateUrlAndState]);

   // Update URL when filter changes
   useEffect(() => {
      if (!isInitialLoad) {
         updateUrlAndState(1, filterStatus);
      }
   }, [filterStatus, updateUrlAndState, isInitialLoad]);

   // Validate current page when total pages changes
   useEffect(() => {
      if (totalPages > 0 && currentPage > totalPages) {
         updateUrlAndState(Math.min(currentPage, totalPages), filterStatus);
      }
   }, [totalPages, currentPage, filterStatus, updateUrlAndState]);

   const indexOfLastUser = currentPage * usersPerPage;
   const indexOfFirstUser = indexOfLastUser - usersPerPage;
   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

   const paginate = (pageNumber) => {
      updateUrlAndState(pageNumber, filterStatus);
   };

   const handleFilterChange = (newStatus) => {
      setFilterStatus(newStatus);
   };

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
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                     <div className="w-full md:w-1/2">
                        <form className="relative" onSubmit={(e) => e.preventDefault()}>
                           <input
                              type="text"
                              className="bg-gray-50 border text-gray-900 text-sm rounded-xl focus:ring-blue-600 focus:border-blue-600 block w-full p-2 dark:bg-gray-700"
                              placeholder="Search users..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </form>
                     </div>
                     <FilterDropdown 
                        filterStatus={filterStatus} 
                        setFilterStatus={handleFilterChange}
                     />
                  </div>
                  {loading ? (
                     <div className="flex justify-center items-center min-h-[200px]">
                        <SpinnerLoading />
                     </div>
                  ) : error ? (
                     <div className="text-red-500 p-4">{error}</div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-gray-500 text-left">
                           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                              <tr>
                                 <th className="px-4 py-3">User ID</th>
                                 <th className="px-4 py-3">Name</th>
                                 <th className="px-4 py-3">Email</th>
                                 <th className="px-2 py-3">Admin Status</th>
                                 <th className="px-4 py-3">Created At</th>
                                 <th className="px-4 py-3">Actions</th>
                              </tr>
                           </thead>
                           <tbody>
                              {currentUsers.map((user) => (
                                 <tr key={user._id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-3">{user._id}</td>
                                    <td className="px-4 py-3 max-w-44">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">
                                       <span className={`px-2 py-1 rounded-full text-xs ${user.isAdmin ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                          {user.isAdmin ? "Admin" : "User"}
                                       </span>
                                    </td>
                                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-gray-100">
                                       {userInfo?._id !== user._id && (
                                          <>
                                             <button
                                                onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                                                className={`px-3 py-1 rounded-lg w-28 text-center min-w-32 ${user.isAdmin ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                                             >
                                                {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                                             </button>
                                             <button
                                                onClick={() => openDeleteModal(user)}
                                                disabled={user.isAdmin}
                                                className={`px-3 py-1 ml-2 rounded-lg ${user.isAdmin ? "bg-red-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                                             >
                                                Delete
                                             </button>
                                          </>
                                       )}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
                  <nav className="flex justify-between items-center p-4">
                     <span>
                        Showing <strong>{indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong>
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
                        {Array.from({ length: totalPages }).map((_, index) => (
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
                              disabled={currentPage === totalPages}
                              className="px-3 py-1 disabled:opacity-50"
                           >
                              Next
                           </button>
                        </li>
                     </ul>
                  </nav>
               </div>
            </div>
         </section>
      </>
   );
};

export default ViewUsers;