import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { fetchOrderListAction, deleteOrderAction, approveOrderAction } from "../../Redux/Actions/Order";
import { decreaseProductQuantityAction } from "../../Redux/Actions/Product";
import { userListAction } from "../../Redux/Actions/User";
import { SpinnerLoading } from "../../components/Spinner";
import OrderDetailsModal from "./OrderDetailsModal";
import DeleteOrderModal from "./DeleteOrderModal";
import ApproveOrderModal from "./ApproveOrderModal";
import OrderReceiptModal from "./OrderReceiptModal";
import CreateOrderModal from "./CreateOrderModal";
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
   const [isInitialLoad, setIsInitialLoad] = useState(true);

   const [selectedOrder, setSelectedOrder] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [orderToDelete, setOrderToDelete] = useState(null);

   const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
   const [orderToApprove, setOrderToApprove] = useState(null);

   const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
   const [orderForReceipt, setOrderForReceipt] = useState(null);

   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

   const ordersPerPage = 10;

   // Initialize from URL on mount
   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get("page"));
      if (pageFromUrl && !isNaN(pageFromUrl)) {
         setCurrentPage(pageFromUrl);
      }
      dispatch(fetchOrderListAction());
      dispatch(userListAction());
      setIsInitialLoad(false);
   }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

   // Re-fetch on refreshFlag change (skip initial)
   useEffect(() => {
      if (!isInitialLoad) {
         dispatch(fetchOrderListAction());
      }
   }, [refreshFlag]); // eslint-disable-line react-hooks/exhaustive-deps

   const getUserName = useCallback(
      (order) => {
         if (order.user?.name && order.user.name !== "Guest User") {
            return order.user.name;
         }
         const user = users.find((u) => u._id === order.userId);
         return user ? user.name : "Unknown User";
      },
      [users]
   );

   const filteredOrders = useMemo(() => {
      const lower = searchTerm.toLowerCase();
      return [...orders]
         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
         .filter(
            (order) =>
               order.orderId?.toLowerCase().includes(lower) ||
               getUserName(order).toLowerCase().includes(lower) ||
               order.productId?.toLowerCase().includes(lower)
         );
   }, [orders, searchTerm, getUserName]);

   const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

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

   // Clamp page if total pages shrinks
   useEffect(() => {
      if (!isInitialLoad && totalPages > 0 && currentPage > totalPages) {
         updateUrlAndState(totalPages);
      }
   }, [totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

   // Debounced search — resets to page 1
   const handleSearchChange = useMemo(
      () =>
         debounce((value) => {
            setSearchTerm(value);
            updateUrlAndState(1);
         }, 300),
      [updateUrlAndState]
   );

   const paginate = (pageNumber) => updateUrlAndState(pageNumber);

   const indexOfLastOrder = currentPage * ordersPerPage;
   const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
   const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

   // Graceful empty-state display values
   const showingFrom = filteredOrders.length === 0 ? 0 : indexOfFirstOrder + 1;
   const showingTo = Math.min(indexOfLastOrder, filteredOrders.length);

   const handleViewOrder = (order) => {
      setSelectedOrder(order);
      setIsModalOpen(true);
   };

   const handleApproveOrder = (order) => {
      setOrderToApprove(order);
      setIsApproveModalOpen(true);
   };

   const handleGenerateReceipt = (order) => {
      setOrderForReceipt(order);
      setIsReceiptModalOpen(true);
   };

   const handleOpenDeleteModal = (order) => {
      setOrderToDelete(order);
      setIsDeleteModalOpen(true);
   };

   const handleDeleteSuccess = () => {
      dispatch(fetchOrderListAction()).then(() => {
         const newTotalPages = Math.ceil((filteredOrders.length - 1) / ordersPerPage);
         updateUrlAndState(currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage);
      });
      setOrderToDelete(null);
   };

   const handleApproveSuccess = () => {
      if (orderToApprove?.orderItems?.length > 0) {
         orderToApprove.orderItems.forEach(item => {
            dispatch(decreaseProductQuantityAction(item.productId, 1));
         });
      } else if (orderToApprove?.productId && orderToApprove.productId !== 'MULTIPLE') {
         dispatch(decreaseProductQuantityAction(orderToApprove.productId, 1));
      }
      dispatch(fetchOrderListAction());
      setOrderToApprove(null);
   };

   return (
      <>
         <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
               <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">

                  {/* Search + Create bar */}
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                     <div className="w-full md:w-1/2">
                        <input
                           type="text"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-600 focus:border-blue-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                           placeholder="Search by Order ID, username, or Product ID..."
                           onChange={(e) => handleSearchChange(e.target.value)}
                        />
                     </div>
                     <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 transition-colors"
                     >
                        Create Manual Order
                     </button>
                  </div>

                  {/* Table content */}
                  {loading ? (
                     <div className="flex justify-center items-center min-h-[200px]">
                        <SpinnerLoading />
                     </div>
                  ) : error ? (
                     <div className="text-red-600 text-center py-8">
                        <p className="mb-3">{error}</p>
                        <button
                           onClick={() => dispatch(fetchOrderListAction())}
                           className="text-white bg-blue-500 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors"
                        >
                           Retry
                        </button>
                     </div>
                  ) : filteredOrders.length === 0 ? (
                     <div className="text-gray-500 dark:text-gray-400 p-8 text-center">
                        No orders found.
                     </div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                                 <tr
                                    key={order._id}
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                 >
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                       {order.orderId}
                                    </td>
                                    <td className="px-4 py-3">{getUserName(order)}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{order.productId}</td>
                                    <td className="px-4 py-3">
                                       <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${order.isPending
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                             }`}
                                       >
                                          {order.isPending ? "Pending" : "Approved"}
                                       </span>
                                    </td>
                                    <td className="px-4 py-3">
                                       <div className="flex items-center flex-wrap gap-2">
                                          <button
                                             onClick={() => handleViewOrder(order)}
                                             className="px-3 py-1 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                          >
                                             View
                                          </button>
                                          <button
                                             onClick={() => handleGenerateReceipt(order)}
                                             className="px-3 py-1 rounded-lg text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                                          >
                                             Generate Bill
                                          </button>
                                          <button
                                             onClick={() => handleApproveOrder(order)}
                                             disabled={!order.isPending}
                                             title={!order.isPending ? "Order already approved" : "Approve order"}
                                             className={`px-3 py-1 rounded-lg text-xs font-medium text-white transition-colors ${order.isPending
                                                   ? "bg-green-500 hover:bg-green-600"
                                                   : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-60"
                                                }`}
                                          >
                                             Approve
                                          </button>
                                          <button
                                             onClick={() => handleOpenDeleteModal(order)}
                                             className="px-3 py-1 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                                          >
                                             Delete
                                          </button>
                                       </div>
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
                        Showing{" "}
                        <strong className="text-gray-900 dark:text-white">{showingFrom}–{showingTo}</strong>{" "}
                        of{" "}
                        <strong className="text-gray-900 dark:text-white">{filteredOrders.length}</strong>{" "}
                        orders
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

         <OrderDetailsModal
            isOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
            orderId={selectedOrder?._id}
         />

         <OrderReceiptModal
            isOpen={isReceiptModalOpen}
            closeModal={() => setIsReceiptModalOpen(false)}
            orderId={orderForReceipt?._id}
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

         <CreateOrderModal
            isOpen={isCreateModalOpen}
            closeModal={() => setIsCreateModalOpen(false)}
            onOrderCreated={() => dispatch(fetchOrderListAction())}
         />
      </>
   );
};

export default ViewOrders;