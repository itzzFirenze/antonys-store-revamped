import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetailAction } from "../Redux/Actions/Order";
import { productAction } from "../Redux/Actions/Product";

const OrderDetail = ({ isOpen, closeModal, orderId }) => {
   const dispatch = useDispatch();
   const { loading, error, order } = useSelector((state) => state.orderDetailReducer);
   const { loading: productLoading, error: productError, product } = useSelector(
      (state) => state.productReducer
   );

   const { userInfo } = useSelector((state) => state.userLoginReducer);

   useEffect(() => {
      if (isOpen && orderId) {
         dispatch(fetchOrderDetailAction(orderId));
      }
   }, [isOpen, orderId, dispatch]);

   useEffect(() => {
      if (order?.productId) {
         dispatch(productAction(order.productId));
      }
   }, [order?.productId, dispatch]);

   const getImageSrc = (image) => {
      if (!image) return "";
      return image.startsWith("data:") || image.startsWith("http")
         ? image
         : `data:image/jpeg;base64,${image}`;
   };

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

   const renderUserDetails = () => {
      if (!userInfo) {
         return (
            <div className="text-gray-500">
               No user information available
            </div>
         );
      }

      return (
         <>
            <p>
               <span className="font-semibold">Name:</span> {userInfo.name}
            </p>
            <p>
               <span className="font-semibold">Email:</span> {userInfo.email}
            </p>
         </>
      );
   };

   const renderMeasurements = () => {
      if (!order?.wantStitched) return null;

      const measurements = [
         { label: "Length", value: order.length },
         { label: "Chest", value: order.chest },
         { label: "Waist", value: order.waist },
         { label: "Hip", value: order.hip },
         { label: "Arm Fit", value: order.armFit },
         { label: "Sleeve Length", value: order.sleeveLength },
         { label: "Sleeve Width", value: order.sleeveWidth },
         { label: "Back Neck", value: order.backNeck },
         { label: "Front Neck", value: order.frontNeck },
      ];

      return (
         <div className="mt-4">
            <h5 className="font-semibold mb-2">Measurements</h5>
            <div className="grid grid-cols-2 gap-2">
               {measurements.map(
                  ({ label, value }) =>
                     value && (
                        <p key={label}>
                           <span className="font-medium">{label}:</span> {value}
                        </p>
                     )
               )}
            </div>
         </div>
      );
   };

   const renderProductDetails = () => {
      if (productLoading) {
         return <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>;
      }

      if (productError) {
         return (
            <div className="text-red-500">
               Error loading product details. Please try again.
            </div>
         );
      }

      if (!product) {
         return (
            <div className="text-gray-500">
               Product information is not available.
            </div>
         );
      }

      return (
         <>
            {product.image ? (
               <img
                  src={getImageSrc(product.image)}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                     e.target.src = "/api/placeholder/400/320";
                     e.target.alt = "Product image not available";
                  }}
               />
            ) : (
               <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-500">No image available</span>
               </div>
            )}
            <div className="space-y-2">
               <p>
                  <span className="font-semibold">Product Name:</span> {product.name}
               </p>
               {order?.size && (
                  <p>
                     <span className="font-semibold">Size:</span> {order.size}
                  </p>
               )}
               <p>
                  <span className="font-semibold">Price:</span> <span className="font-[inter]">₹</span>
                  <span>{product.price}</span>
                  <span className="text-sm text-gray-600 ml-1">+<span className="font-[inter]">₹</span>50 for delivery charge</span>
               </p>
               <p>
                  <span className="font-semibold">Total:</span> <span className="font-[inter]">₹</span>{product.price + 50}
               </p>
               <p>
                  <span className="font-semibold">Brand:</span> {product.brand}
               </p>
               <p>
                  <span className="font-semibold">Category:</span> {product.category}
               </p>
               <p>
                  <span className="font-semibold">Color:</span> {product.color}
               </p>
            </div>
            <hr className="my-2 border-gray-300" />
            {order?.additionalDetails && (
               <div className="mt-4">
                  <h5 className="font-semibold mb-2">Additional Details</h5>
                  <p className="text-gray-700">{order.additionalDetails}</p>
               </div>
            )}
         </>
      );
   };

   if (!isOpen) return null;

   if (loading) {
      return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-4xl bg-white rounded-lg p-4 mx-2 max-h-[90vh] overflow-hidden">
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
         <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" />
            <div className="w-full max-w-4xl bg-white rounded-lg p-4 mx-2">
               <div className="text-red-500">
                  Error loading order details. Please try again.
               </div>
            </div>
         </div>
      );
   }

   if (!order) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         {/* Backdrop */}
         <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeModal} />

         {/* Modal Container */}
         <div className="relative flex flex-col w-full max-w-4xl mx-2 max-h-[90vh] bg-white rounded-lg shadow">
            {/* Modal Header */}
            <div className="flex-none flex justify-between items-center p-3 sm:p-4 border-b">
               <h3 className="text-lg sm:text-xl font-semibold truncate">
                  Order Details - {order.orderId}
               </h3>
               <button
                  onClick={closeModal}
                  className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5"
                  aria-label="Close modal"
               >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                     <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                     />
                  </svg>
               </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Order Info */}
                  <div>
                     <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                        Order Information
                     </h4>
                     <div className="space-y-2 sm:space-y-3">
                        {renderUserDetails()}
                        <p>
                           <span className="font-semibold">Order ID:</span> {order.orderId}
                        </p>
                        <p>
                           <span className="font-semibold">Order Date:</span>{" "}
                           {new Date(order.createdAt).toLocaleDateString("en-GB")}
                        </p>
                        <p>
                           <span className="font-semibold">Status:</span>{" "}
                           <span
                              className={`px-2 py-1 rounded-full text-xs ${order.isPending
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                 }`}
                           >
                              {order.isPending ? "Pending" : "Approved"}
                           </span>
                        </p>
                        <p>
                           <span className="font-semibold">Shipping Address:</span> {order.address}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                           <p>
                              <span className="font-semibold">Pincode:</span> {order.pincode}
                           </p>
                           <p>
                              <span className="font-semibold">Phone:</span> {order.phoneNumber}
                           </p>
                        </div>
                        {renderMeasurements()}
                     </div>
                  </div>

                  {/* Product Info */}
                  <div>
                     <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                        Product Details
                     </h4>
                     <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        {renderProductDetails()}
                     </div>
                  </div>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-none flex justify-end p-3 sm:p-4 border-t">
               <button
                  type="button"
                  onClick={closeModal}
                  className="w-full sm:w-auto text-gray-100 bg-fuchsia-800 hover:bg-fuchsia-900 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
               >
                  Close
               </button>
            </div>
         </div>
      </div>
   );
};

export default OrderDetail;