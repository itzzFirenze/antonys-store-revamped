import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetailAction } from "../../Redux/Actions/Order";
import { productAction, productListAction } from "../../Redux/Actions/Product";
import { userListAction } from "../../Redux/Actions/User";
import DeleteOrderModal from "./DeleteOrderModal";

const OrderDetailsModal = ({ isOpen, closeModal, orderId }) => {
   const dispatch = useDispatch();
   const { loading, error, order } = useSelector((state) => state.orderDetailReducer);
   const { loading: productLoading, error: productError, product } = useSelector((state) => state.productReducer);
   const { products } = useSelector((state) => state.productListReducer);
   const { loading: userLoading, error: userError, users } = useSelector((state) => state.userListReducer);

   const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

   useEffect(() => {
      if (isOpen && orderId) {
         dispatch(fetchOrderDetailAction(orderId));
      }
   }, [isOpen, orderId, dispatch]);

   useEffect(() => {
      if (order?.productId && order.productId !== "MULTIPLE") {
         dispatch(productAction(order.productId));
      }
      if (order?.orderItems && order.orderItems.length > 0) {
         if (!products || products.length === 0) {
            dispatch(productListAction());
         }
      }
      if (order?.userId) {
         dispatch(userListAction());
      }
   }, [order, dispatch, products]);

   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }

      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [isOpen]);

   const getUserDetails = () => {
      if (order?.user && order.user.name && order.user.name !== "Guest User") {
         return {
            _id: "Manual Order",
            name: order.user.name,
            email: order.user.email
         };
      }
      if (!users || !order?.userId) return null;
      return users.find((user) => user._id === order.userId);
   };

   const handleDeleteClick = () => {
      setDeleteModalOpen(true);
   };

   const handleDeleteModalClose = () => {
      setDeleteModalOpen(false);
   };

   const handleDeleteSuccess = () => {
      handleDeleteModalClose();
      closeModal();

      if (order?.productId && order.productId !== "MULTIPLE") {
         dispatch(productAction(order.productId));
      }
   };

   const getImageSrc = (image) => {
      if (!image) return "";
      return image.startsWith("data:") || image.startsWith("http")
         ? image
         : `data:image/jpeg;base64,${image}`;
   };

   const renderMeasurements = (item) => {
      if (!item?.wantStitched) return null;

      const measurements = [
         { label: "Length", value: item.length },
         { label: "Chest", value: item.chest },
         { label: "Waist", value: item.waist },
         { label: "Hip", value: item.hip },
         { label: "Arm Fit", value: item.armFit },
         { label: "Sleeve Length", value: item.sleeveLength },
         { label: "Sleeve Width", value: item.sleeveWidth },
         { label: "Back Neck", value: item.backNeck },
         { label: "Front Neck", value: item.frontNeck },
      ];

      return (
         <div className="mt-3 bg-gray-50 p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
            <h6 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Measurements</h6>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
               {measurements.map(({ label, value }) =>
                  value && (
                     <div key={label} className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-400">{label}:</span> 
                        <span className="text-gray-900 dark:text-gray-200">{value}</span>
                     </div>
                  )
               )}
            </div>
         </div>
      );
   };

   const renderProductCard = (pDetails, itemInfo) => {
      if (!pDetails) return <div key={itemInfo.productId} className="p-4 text-red-500 border rounded-lg mb-4 shadow-sm bg-white dark:bg-gray-800">Product details not found for ID: {itemInfo.productId}</div>;

      return (
         <div key={itemInfo.productId + (itemInfo.size || '')} className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm">
            <div className="w-full sm:w-1/3 flex-shrink-0">
               {pDetails.image ? (
                  <img
                     src={getImageSrc(pDetails.image)}
                     alt={pDetails.name}
                     className="w-full h-40 sm:h-full object-cover rounded-lg"
                     onError={(e) => {
                        e.target.src = "/api/placeholder/400/320";
                     }}
                  />
               ) : (
                  <div className="w-full h-40 sm:h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                     <span className="text-gray-500 text-sm">No image</span>
                  </div>
               )}
            </div>
            <div className="flex-1 space-y-1.5 text-sm">
               <h5 className="font-bold text-gray-900 dark:text-white text-base">{pDetails.name}</h5>
               <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-gray-700 dark:text-gray-400">Code:</span> {pDetails.productCode || pDetails._id}</p>
               {itemInfo.size && <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-gray-700 dark:text-gray-400">Size:</span> {itemInfo.size}</p>}
               <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-gray-700 dark:text-gray-400">Brand:</span> {pDetails.brand}</p>
               <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-gray-700 dark:text-gray-400">Color:</span> {pDetails.color}</p>
               <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-gray-700 dark:text-gray-400">Price:</span> <span className="font-[inter]">₹</span>{pDetails.price}</p>
               
               {renderMeasurements(itemInfo)}
            </div>
         </div>
      );
   };

   const renderProductDetails = () => {
      // Multiple items mode
      if (order?.orderItems && order.orderItems.length > 0) {
          if (!products || products.length === 0) {
              return <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>;
          }
          
          let subtotal = 0;
          const renderedItems = order.orderItems.map((item, idx) => {
              const p = products.find(p => p._id === item.productId);
              if (p) subtotal += p.price;
              return renderProductCard(p, item);
          });
          
          return (
             <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700">
                   <div className="flex justify-between items-center mb-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Subtotal ({order.orderItems.length} items):</span> 
                      <span><span className="font-[inter]">₹</span>{subtotal.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between items-center mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Delivery Charge:</span> 
                      <span>+ <span className="font-[inter]">₹</span>50</span>
                   </div>
                   <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-600">
                      <span className="text-base font-bold text-gray-900 dark:text-white">Total Amount:</span>
                      <span className="text-base font-bold text-gray-900 dark:text-white"><span className="font-[inter]">₹</span>{(subtotal + 50).toLocaleString('en-IN')}</span>
                   </div>
                </div>
                
                <h5 className="font-semibold text-gray-900 dark:text-white mt-4 mb-2">Order Items</h5>
                {renderedItems}
                
                {order?.additionalDetails && (
                   <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm">
                      <h5 className="font-semibold mb-2">Order Notes / Details</h5>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{order.additionalDetails}</p>
                   </div>
                )}
             </div>
          );
      }

      // Single item mode
      if (productLoading) {
         return <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>;
      }
      if (productError) {
         return <div className="text-red-500">Error loading product details. Please try again.</div>;
      }
      if (!product) {
         return <div className="text-gray-500">Product information is not available.</div>;
      }

      return (
         <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700">
                <div className="flex justify-between items-center mb-1 text-sm text-gray-600 dark:text-gray-400">
                   <span className="font-medium">Subtotal (1 item):</span> 
                   <span><span className="font-[inter]">₹</span>{product.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center mb-3 text-sm text-gray-600 dark:text-gray-400">
                   <span className="font-medium">Delivery Charge:</span> 
                   <span>+ <span className="font-[inter]">₹</span>50</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-600">
                   <span className="text-base font-bold text-gray-900 dark:text-white">Total Amount:</span>
                   <span className="text-base font-bold text-gray-900 dark:text-white"><span className="font-[inter]">₹</span>{(product.price + 50).toLocaleString('en-IN')}</span>
                </div>
            </div>
            
            <h5 className="font-semibold text-gray-900 dark:text-white mt-4 mb-2">Order Item</h5>
            {renderProductCard(product, order)}
            
            {order?.additionalDetails && (
               <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm">
                  <h5 className="font-semibold mb-2">Order Notes / Details</h5>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{order.additionalDetails}</p>
               </div>
            )}
         </div>
      );
   };

   if (!isOpen) return null;

   if (loading) {
      return (
         <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="relative w-full max-w-5xl bg-white rounded-lg p-4 my-4 mx-2">
               <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded-lg w-1/2"></div>
                  <div className="grid grid-cols-1 gap-4">
                     <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                     </div>
                     <div className="h-48 bg-gray-200 rounded-lg"></div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" />
            <div className="fixed inset-0 flex items-start justify-center">
               <div className="w-full max-w-5xl bg-white rounded-lg p-4 m-4">
                  <div className="text-red-500">
                     Error loading order details. Please try again.
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (!order) return null;

   const user = getUserDetails();

   return (
      <div className="fixed inset-0 z-50">
         {/* Backdrop */}
         <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeModal} />

         {/* Modal Container */}
         <div className="fixed inset-0 flex items-start justify-center pointer-events-none">
            <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-lg shadow my-4 mx-2 pointer-events-auto flex flex-col max-h-[calc(100vh-2rem)]">
               {/* Modal Header */}
               <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-5 border-b dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg shadow-sm z-10">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                     Order Details <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">#{order.orderId}</span>
                  </h3>
                  <button
                     onClick={closeModal}
                     className="text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white rounded-lg p-1.5 transition-colors"
                     aria-label="Close modal"
                  >
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                           fillRule="evenodd"
                           d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                           clipRule="evenodd"
                        />
                     </svg>
                  </button>
               </div>

               {/* Modal Body */}
               <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                     {/* Left Column: Order Info */}
                     <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b dark:border-gray-700 pb-2">
                               Customer Info
                            </h4>
                            <div className="space-y-3 text-sm">
                               {userLoading && <p className="text-gray-500">Loading user details...</p>}
                               {userError && <p className="text-red-500">Error loading user details: {userError}</p>}
                               {user && (
                                  <>
                                     <p className="flex flex-col"><span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-0.5">Name</span> <span className="font-medium text-gray-900 dark:text-gray-200">{user.name}</span></p>
                                     <p className="flex flex-col"><span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-0.5">Email</span> <span className="text-gray-900 dark:text-gray-200 break-all">{user.email}</span></p>
                                     <p className="flex flex-col"><span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-0.5">Phone</span> <span className="text-gray-900 dark:text-gray-200">{order.phoneNumber}</span></p>
                                  </>
                               )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b dark:border-gray-700 pb-2">
                               Shipping & Status
                            </h4>
                            <div className="space-y-4 text-sm">
                               <div>
                                   <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Status</p>
                                   <span
                                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${order.isPending
                                            ? "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                                            : "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                                         }`}
                                   >
                                      {order.isPending ? "Pending" : "Approved"}
                                   </span>
                               </div>
                               <div>
                                   <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Order Date</p>
                                   <p className="font-medium text-gray-900 dark:text-gray-200">{new Date(order.createdAt).toLocaleDateString("en-GB", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                               </div>
                               <div>
                                   <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Address</p>
                                   <p className="text-gray-900 dark:text-gray-200 leading-relaxed">{order.address}</p>
                               </div>
                               <div>
                                   <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Pincode</p>
                                   <p className="font-medium text-gray-900 dark:text-gray-200">{order.pincode}</p>
                               </div>
                            </div>
                        </div>
                     </div>

                     {/* Right Column: Product Details */}
                     <div className="lg:col-span-8">
                         {renderProductDetails()}
                     </div>
                  </div>
               </div>

               {/* Modal Footer */}
               <div className="flex-shrink-0 flex justify-end p-4 sm:p-5 border-t dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg z-10 gap-3">
                  <button
                     type="button"
                     onClick={handleDeleteClick}
                     className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                  >
                     Delete Order
                  </button>
                  <button
                     type="button"
                     onClick={closeModal}
                     className="text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                  >
                     Close
                  </button>
               </div>
            </div>
         </div>

         {/* DeleteOrderModal */}
         <DeleteOrderModal
            isOpen={isDeleteModalOpen}
            closeModal={handleDeleteModalClose}
            order={order}
            onDeleteSuccess={handleDeleteSuccess}
         />
      </div>
   );
};

export default OrderDetailsModal;