import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { productAction, productListAction } from "../../Redux/Actions/Product";
import { BASE_URL } from "../../Redux/Constants/BASE_URL";

const ApproveOrderModal = ({ isOpen, closeModal, order, onApproveSuccess }) => {
   const dispatch = useDispatch();
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(false);

   const { product } = useSelector((state) => state.productReducer);
   const { products } = useSelector((state) => state.productListReducer);

   useEffect(() => {
      if (isOpen) {
         if (order?.productId && order.productId !== "MULTIPLE") {
            dispatch(productAction(order.productId));
         }
         if (order?.orderItems && order.orderItems.length > 0) {
            if (!products || products.length === 0) {
               dispatch(productListAction());
            }
         }
      }
   }, [isOpen, order?.productId, order?.orderItems?.length, dispatch]);

   if (!isOpen) return null;

   let totalAmount = 50;
   if (order?.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach((item) => {
         const p = products?.find(p => p._id === item.productId);
         if (p) totalAmount += p.price || 0;
      });
   } else if (product) {
      totalAmount += product.price || 0;
   }

   const handleWhatsAppRedirect = () => {
      const message = `Dear Customer, we have successfully received your payment of ₹${totalAmount.toLocaleString('en-IN')} for order ${encodeURIComponent(order.orderId)}. Your order is confirmed! Please find your receipt attached. Thank you for shopping with us!`;

      const whatsappNumber = '91' + (order.phoneNumber?.replace(/\D/g, '') || '');
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`;
      window.open(whatsappUrl, '_blank');
   };

   const handleApprove = async () => {
      setLoading(true);
      setError(null);
   
      try {
         // First approve the order
         const orderResponse = await fetch(`${BASE_URL}/api/orders/${order._id}/approve`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
            },
         });
   
         if (!orderResponse.ok) {
            throw new Error(`Failed to approve order: ${orderResponse.statusText}`);
         }
   
         // Then update the product quantity
         const productResponse = await fetch(`${BASE_URL}/api/products/decrease-quantity/${order.productId}`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               quantity: 1,
               size: order.size,
               category: product?.category
            })
         });
   
         if (!productResponse.ok) {
            throw new Error(`Failed to update product quantity: ${productResponse.statusText}`);
         }
   
         onApproveSuccess();
         handleWhatsAppRedirect();
         closeModal();
         
         // Refresh the product data
         dispatch(productAction(order.productId));
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
         <div className="relative w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mark as Paid
               </h3>
               <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5"
               >
                  <svg
                     className="w-5 h-5"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                     />
                  </svg>
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
               <div className="mb-4 text-gray-700 dark:text-gray-300">
                  <p className="mb-2">Order ID: {order.orderId}</p>
                  <p className="mb-4">Total Amount: ₹{totalAmount.toLocaleString('en-IN')}</p>

                  <p>Are you sure you want to mark this order as paid? This will:</p>
               </div>
               <ul className="mb-4 ml-4 list-disc text-gray-700 dark:text-gray-300">
                  <li>Mark the order as paid in the system</li>
                  <li>Open WhatsApp with a pre-loaded payment confirmation message</li>
               </ul>

               {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                     {error}
                  </div>
               )}

               <div className="flex justify-end space-x-4">

                  <button
                     type="button"
                     onClick={handleApprove}
                     disabled={loading}
                     className={`text-gray-100 bg-green-500 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                  >
                     {loading ? "Processing..." : "Mark as Paid"}
                  </button>
                  <button
                     type="button"
                     onClick={closeModal}
                     className="text-gray-600 bg-gray-100 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                     Cancel
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ApproveOrderModal;