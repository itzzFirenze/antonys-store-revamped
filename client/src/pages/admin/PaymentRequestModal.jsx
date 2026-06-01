import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { productAction } from "../../Redux/Actions/Product";
import { BASE_URL } from "../../Redux/Constants/BASE_URL";

const PaymentRequestModal = ({ isOpen, closeModal, order, onPaymentRequested }) => {
   const dispatch = useDispatch();
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const { product } = useSelector((state) => state.productReducer);

   useEffect(() => {
      if (isOpen && order?.productId) {
         dispatch(productAction(order.productId));
      }
   }, [isOpen, order?.productId, dispatch]);

   if (!isOpen) return null;

   const handleWhatsAppRedirect = () => {
      const message = `Dear Customer,%0A%0A` +
         `Payment request for your order:%0A%0A` +
         `Order Details:%0A` +
         `Order ID: ${encodeURIComponent(order.orderId)}%0A` +
         `Amount Due: ₹${encodeURIComponent(product?.price + 50 || 0)}%0A%0A` +
         `A payment request has been sent to your preferred payment app. Please complete the payment of ₹${encodeURIComponent(product?.price + 50 || 0)} to confirm your order.%0A%0A` +
         `Once payment is confirmed, your order will be processed immediately.`;

      const whatsappNumber = '91' + order.phoneNumber?.replace(/\D/g, '') || '';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
   };

   const handlePaymentRequest = async () => {
      setLoading(true);
      setError(null);

      try {
         // Match the same URL pattern as the working approve endpoint
         const response = await fetch(`${BASE_URL}/api/orders/${order._id}/request-payment`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
            }
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || 'Failed to request payment');
         }

         if (data.order.isReqPayment) {
            handleWhatsAppRedirect();
            onPaymentRequested();
            closeModal();
         } else {
            throw new Error('Failed to update payment request status');
         }
      } catch (err) {
         console.error('Payment request error:', err);
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
         <div className="relative w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-800">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Request Payment
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

            <div className="p-6">
               <div className="mb-4 text-gray-700 dark:text-gray-300">
                  <p className="mb-2">Order ID: {order.orderId}</p>
                  <p className="mb-4">Amount Due: ₹{product?.price + 50 || 0}</p>

                  <p>Sending payment request will:</p>
               </div>
               <ul className="mb-4 ml-4 list-disc text-gray-700 dark:text-gray-300">
                  <li>Send a payment request notification to the customer</li>
                  <li>Send a WhatsApp message with payment instructions</li>
               </ul>

               {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                     {error}
                  </div>
               )}

               <div className="flex justify-end space-x-4">
                  <button
                     type="button"
                     onClick={closeModal}
                     className="text-gray-600 bg-gray-100 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                     Cancel
                  </button>
                  <button
                     type="button"
                     onClick={handlePaymentRequest}
                     disabled={loading}
                     className={`text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                     }`}
                  >
                     {loading ? "Processing..." : "Send Payment Request"}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PaymentRequestModal;