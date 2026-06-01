import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { fetchOrderListAction, completeOrderAction } from "../../Redux/Actions/Order";
import { SpinnerLoading } from "../../components/Spinner";
import { productAction } from "../../Redux/Actions/Product";
import OrderDetailsModal from "./OrderDetailsModal";
import DeleteOrderModal from "./DeleteOrderModal";
import debounce from "lodash.debounce";

const ViewApprovedOrders = () => {
   const { refreshFlag } = useOutletContext();
   const dispatch = useDispatch();
   const location = useLocation();
   const navigate = useNavigate();

   const { product } = useSelector((state) => state.productReducer);
   const { loading = false, error, orders = [] } = useSelector(
      (state) => state.orderListReducer || { orders: [] }
   );

   const { users = [] } = useSelector((state) => state.userListReducer || { users: [] });

   const [searchTerm, setSearchTerm] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [localOrders, setLocalOrders] = useState([]);
   const ordersPerPage = 10;

   const getUserName = (userId) => {
      const user = users.find(user => user._id === userId);
      return user ? user.name : "Unknown User";
   };

   // Initialize from URL and fetch data on mount
   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get('page'));
      
      if (pageFromUrl && !isNaN(pageFromUrl)) {
         setCurrentPage(pageFromUrl);
      }
      
      dispatch(fetchOrderListAction());
   }, [dispatch, location.search, refreshFlag]);

   useEffect(() => {
      setLocalOrders(orders);
   }, [orders]);

   const handleSearchChange = debounce((value) => {
      setSearchTerm(value);
      updateUrlAndState(1);
   }, 300);

   const filteredOrders = [...localOrders]
      .reverse()
      .filter(
         (order) =>
            !order.isPending &&
            (order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               order.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               order.productId?.toLowerCase().includes(searchTerm.toLowerCase()))
      );

   const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

   // Handle page navigation
   const updateUrlAndState = useCallback((page) => {
      const validatedPage = Math.min(Math.max(1, page), totalPages || 1);
      const params = new URLSearchParams(location.search);
      params.set('page', validatedPage.toString());
      navigate(`?${params.toString()}`, { replace: true });
      setCurrentPage(validatedPage);
   }, [navigate, totalPages, location.search]);

   // Validate current page when total pages changes
   useEffect(() => {
      if (totalPages > 0 && currentPage > totalPages) {
         updateUrlAndState(Math.min(currentPage, totalPages));
      }
   }, [totalPages, currentPage, updateUrlAndState]);

   const handleDeleteSuccess = (deletedOrderId) => {
      setLocalOrders(prevOrders => {
         const remainingOrders = prevOrders.filter(order => order._id !== deletedOrderId);
         const newTotalPages = Math.ceil(remainingOrders.length / ordersPerPage);
         
         // If current page would be empty after deletion, go to the last available page
         if (currentPage > newTotalPages) {
            updateUrlAndState(Math.max(1, newTotalPages));
         } else {
            // Stay on the current page
            updateUrlAndState(currentPage);
         }
         
         return remainingOrders;
      });
   };

   const indexOfLastOrder = currentPage * ordersPerPage;
   const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
   const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

   const paginate = (pageNumber) => {
      if (pageNumber > 0 && pageNumber <= Math.ceil(filteredOrders.length / ordersPerPage)) {
         updateUrlAndState(pageNumber);
      }
   };

   const handleViewOrder = (order) => {
      setSelectedOrder(order);
      setIsModalOpen(true);
   };

   useEffect(() => {
      if (isModalOpen && selectedOrder?.productId) {
         dispatch(productAction(selectedOrder.productId));
      }
   }, [isModalOpen, selectedOrder?.productId, dispatch]);
   
   const handleWhatsAppRedirect = (order) => {
      const message = `Dear Customer,%0A%0A` +
         `Your product has been shipped!%0A%0A` +
         `Order Details:%0A` +
         `Order ID: ${encodeURIComponent(order.orderId)}%0A` +
         `Status: Completed%0A` +
         `Total Amount: ₹${encodeURIComponent(product?.price + 50 || 0)}%0A%0A` +
         `Thank you for shopping with us! We hope you enjoy your purchase.`;
   
      const whatsappNumber = '91' + order.phoneNumber?.replace(/\D/g, '') || '';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
   };

   const handleCompleteOrder = (order) => {
      dispatch(completeOrderAction(order._id));
      handleWhatsAppRedirect(order);
   };

   return (
      <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
         <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
               <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                  <div className="w-full md:w-1/2">
                     <input
                        type="text"
                        className="bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Search by Order ID, User ID or Product ID"
                        onChange={(e) => handleSearchChange(e.target.value)}
                     />
                  </div>
               </div>

               {loading ? (
                  <SpinnerLoading />
               ) : error ? (
                  <div className="text-red-500 text-center py-4">
                     <p>{error}</p>
                     <button
                        onClick={() => dispatch(fetchOrderListAction())}
                        className="mt-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2"
                     >
                        Retry
                     </button>
                  </div>
               ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No orders found.</div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                           <tr>
                              <th className="px-4 py-3">Order ID</th>
                              <th className="px-4 py-3">User Name</th>
                              <th className="px-4 py-3">Product ID</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {currentOrders.map((order) => (
                              <tr key={order._id} className="border-b dark:border-gray-700">
                                 <td className="px-4 py-3">{order.orderId}</td>
                                 <td className="px-4 py-3">{getUserName(order.userId)}</td>
                                 <td className="px-4 py-3">{order.productId}</td>
                                 <td className="px-4 py-3">
                                    <span
                                       className={`px-2 py-1 rounded-full text-xs ${
                                          order.isCompleted
                                             ? "bg-green-100 text-green-800"
                                             : "bg-yellow-100 text-yellow-800"
                                       }`}
                                    >
                                       {order.isCompleted ? "Completed" : "In Progress"}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3 space-x-2">
                                    <button
                                       onClick={() => handleViewOrder(order)}
                                       className="text-gray-100 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1"
                                    >
                                       View
                                    </button>
                                    <button
                                       onClick={() => handleCompleteOrder(order)}
                                       disabled={order.isCompleted}
                                       className={`text-gray-100 rounded-lg px-3 py-1 ${
                                          order.isCompleted
                                             ? "bg-gray-400 cursor-not-allowed"
                                             : "bg-green-500 hover:bg-green-700"
                                       }`}
                                    >
                                       Complete
                                    </button>
                                    <button
                                       onClick={() => {
                                          setSelectedOrder(order);
                                          setIsDeleteModalOpen(true);
                                       }}
                                       className="text-gray-100 bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1"
                                    >
                                       Delete
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}

               {filteredOrders.length > 0 && (
                  <nav className="flex justify-between items-center p-4" aria-label="Table navigation">
                     <span>
                        Showing{" "}
                        <strong>
                           {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)}
                        </strong>{" "}
                        of <strong>{filteredOrders.length}</strong>
                     </span>
                     <ul className="inline-flex items-center">
                        <li>
                           <button
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`px-3 py-1 ${currentPage === 1 ? "cursor-not-allowed text-gray-400" : ""}`}
                           >
                              Previous
                           </button>
                        </li>
                        {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }).map((_, index) => (
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
                              disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                              className={`px-3 py-1 ${
                                 currentPage === Math.ceil(filteredOrders.length / ordersPerPage)
                                    ? "cursor-not-allowed text-gray-400"
                                    : ""
                              }`}
                           >
                              Next
                           </button>
                        </li>
                     </ul>
                  </nav>
               )}
            </div>
         </div>

         <OrderDetailsModal
            isOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
            orderId={selectedOrder?._id}
         />

         <DeleteOrderModal
            isOpen={isDeleteModalOpen}
            closeModal={() => setIsDeleteModalOpen(false)}
            order={selectedOrder}
            onDeleteSuccess={() => handleDeleteSuccess(selectedOrder?._id)}
         />
      </section>
   );
};

export default ViewApprovedOrders;