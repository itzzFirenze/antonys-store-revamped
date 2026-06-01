import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { fetchOrderListAction, deleteOrderAction, approveOrderAction } from "../../Redux/Actions/Order";
import { decreaseProductQuantityAction } from "../../Redux/Actions/Product";
import { userListAction } from "../../Redux/Actions/User";
import { SpinnerLoading } from "../../components/Spinner";
import OrderDetailsModal from "./OrderDetailsModal";
import DeleteOrderModal from "./DeleteOrderModal";
import ApproveOrderModal from "./ApproveOrderModal";
import PaymentRequestModal from "./PaymentRequestModal";
import debounce from "lodash.debounce";

const ViewOrders = () => {
   const { refreshFlag } = useOutletContext();
   const dispatch = useDispatch();
   const location = useLocation();
   const navigate = useNavigate();

   const { loading = false, error, orders = [] } = useSelector(
      (state) => state.orderListReducer || { orders: [] }
   );

   const { users = [] } = useSelector((state) => state.userListReducer || { users: [] });

   const [searchTerm, setSearchTerm] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [orderToDelete, setOrderToDelete] = useState(null);
   const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
   const [orderToApprove, setOrderToApprove] = useState(null);
   const [isPaymentRequestModalOpen, setIsPaymentRequestModalOpen] = useState(false);
   const [orderForPayment, setOrderForPayment] = useState(null);
   const ordersPerPage = 10;

   // Initialize from URL and fetch data on mount
   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get('page'));

      if (pageFromUrl && !isNaN(pageFromUrl)) {
         setCurrentPage(pageFromUrl);
      }

      dispatch(fetchOrderListAction());
      dispatch(userListAction());
   }, [dispatch, location.search, refreshFlag]);

   const handleSearchChange = debounce((value) => {
      setSearchTerm(value);
      updateUrlAndState(1);
   }, 300);

   const getUserName = (userId) => {
      const user = users.find(user => user._id === userId);
      return user ? user.name : "Unknown User";
   };

   const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

   const filteredOrders = sortedOrders.filter((order) => {
      const userName = getUserName(order.userId).toLowerCase();
      return order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         userName.includes(searchTerm.toLowerCase()) ||
         order.productId?.toLowerCase().includes(searchTerm.toLowerCase());
   });

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

   const handleApproveOrder = (order) => {
      setOrderToApprove(order);
      setIsApproveModalOpen(true);
   };

   const handlePaymentRequest = (order) => {
      setOrderForPayment(order);
      setIsPaymentRequestModalOpen(true);
   };

   const handleOpenDeleteModal = (order) => {
      setOrderToDelete(order);
      setIsDeleteModalOpen(true);
   };

   const handleDeleteSuccess = () => {
      dispatch(fetchOrderListAction()).then(() => {
         // Calculate new total pages after deletion
         const newTotalPages = Math.ceil((filteredOrders.length - 1) / ordersPerPage);

         // If current page would be empty after deletion, go to the last available page
         if (currentPage > newTotalPages) {
            updateUrlAndState(Math.max(1, newTotalPages));
         } else {
            // Stay on the current page
            updateUrlAndState(currentPage);
         }
      });
      setOrderToDelete(null);
   };

   const handleApproveSuccess = () => {
      if (orderToApprove && orderToApprove.productId) {
         dispatch(decreaseProductQuantityAction(orderToApprove.productId, 1));
      }
      dispatch(fetchOrderListAction());
      setOrderToApprove(null);
   };

   return (
      <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
         <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
               <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                  <div className="w-full md:w-1/2">
                     <input
                        type="text"
                        className="bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        placeholder="Search by Order ID, Username or Product ID"
                        onChange={(e) => handleSearchChange(e.target.value)}
                     />
                  </div>
               </div>

               {loading ? (
                  <SpinnerLoading />
               ) : error ? (
                  <div className="text-red-600 text-center py-4">
                     <p>{error}</p>
                     <button
                        onClick={() => dispatch(fetchOrderListAction())}
                        className="mt-2 text-white bg-blue-500 hover:bg-blue-700 rounded-lg px-4 py-2"
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
                              <th className="px-4 py-3">Username</th>
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
                                       className={`px-2 py-1 rounded-full text-xs ${order.isPending
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                          }`}
                                    >
                                       {order.isPending ? "Pending" : "Approved"}
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
                                       onClick={() => handlePaymentRequest(order)}
                                       disabled={!order.isPending || order.isReqPayment}
                                       className={`text-gray-100 rounded-lg px-1 py-1 min-w-40 ${order.isPending && !order.isReqPayment
                                          ? "bg-blue-500 hover:bg-blue-600"
                                          : "bg-gray-400 cursor-not-allowed"
                                          }`}
                                    >
                                       {order.isReqPayment ? "Payment Requested" : "Request Payment"}
                                    </button>
                                    <button
                                       onClick={() => handleApproveOrder(order)}
                                       disabled={!order.isPending}
                                       className={`text-gray-100 rounded-lg px-3 py-1 ${order.isPending
                                          ? "bg-green-500 hover:bg-green-600"
                                          : "bg-gray-400 cursor-not-allowed"
                                          }`}
                                    >
                                       Approve
                                    </button>
                                    <button
                                       onClick={() => handleOpenDeleteModal(order)}
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
                              className={`px-3 py-1 ${currentPage === Math.ceil(filteredOrders.length / ordersPerPage)
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

         <PaymentRequestModal
            isOpen={isPaymentRequestModalOpen}
            closeModal={() => setIsPaymentRequestModalOpen(false)}
            order={orderForPayment}
            onPaymentRequested={() => {
               setOrderForPayment(null);
               dispatch(fetchOrderListAction());
            }}
         />

         <DeleteOrderModal
            isOpen={isDeleteModalOpen}
            closeModal={() => setIsDeleteModalOpen(false)}
            order={orderToDelete}
            onDeleteSuccess={handleDeleteSuccess}
         />

         <ApproveOrderModal
            isOpen={isApproveModalOpen}
            closeModal={() => setIsApproveModalOpen(false)}
            order={orderToApprove}
            onApproveSuccess={handleApproveSuccess}
         />
      </section>
   );
};

export default ViewOrders;