import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../Redux/Constants/BASE_URL';

const Toast = ({ message, type }) => (
   <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center w-full z-50">
      <div
         className={`w-auto max-w-sm px-6 py-3 rounded-md shadow-lg text-center ${type === 'success' ? 'bg-blue-600' : 'bg-red-600'} text-white text-sm font-medium`}
      >
         {message}
      </div>
   </div>
);

const OrderModal = ({
   showOrderModal,
   setShowOrderModal,
   product,
   userInfo,
}) => {
   const [needStitching, setNeedStitching] = useState(false);
   const [orderDetails, setOrderDetails] = useState({
      address: userInfo?.address !== 'Not added' ? userInfo?.address || '' : '',
      phoneNumber: userInfo?.mobNum !== 'Not added' ? userInfo?.mobNum || '' : '',
      pincode: userInfo?.pincode !== 'Not added' ? userInfo?.pincode || '' : '',
      additionalDetails: '',
      measurements: {
         length: '',
         chest: '',
         waist: '',
         hip: '',
         armFit: '',
         sleeveLength: '',
         sleeveWidth: '',
         backNeck: '',
         frontNeck: '',
      },
   });

   const [toast, setToast] = useState({ show: false, message: '', type: '' });

   const showToast = (message, type = 'error') => {
      setToast({ show: true, message, type });
      setTimeout(() => {
         setToast({ show: false, message: '', type: '' });
      }, 3000);
   };

   const handleInputChange = (e, field, isNested = false) => {
      if (isNested) {
         setOrderDetails((prev) => ({
            ...prev,
            measurements: {
               ...prev.measurements,
               [field]: e.target.value,
            },
         }));
      } else {
         setOrderDetails((prev) => ({
            ...prev,
            [field]: e.target.value,
         }));
      }
   };

   const handleOrderSubmit = async () => {
      if (!userInfo || !userInfo._id) {
         showToast('Please log in to place an order.', 'error');
         return;
      }

      if (!orderDetails.address.trim()) {
         showToast('Please enter a delivery address.', 'error');
         return;
      }

      if (!orderDetails.phoneNumber.trim()) {
         showToast('Please enter your phone number.', 'error');
         return;
      }

      if (!orderDetails.pincode.trim()) {
         showToast('Please enter a valid pincode.', 'error');
         return;
      }

      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(orderDetails.phoneNumber.trim())) {
         showToast('Please enter a valid 10-digit phone number.', 'error');
         return;
      }

      if (needStitching) {
         for (const [key, value] of Object.entries(orderDetails.measurements)) {
            if (!value) {
               showToast(`Please enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}.`, 'error');
               return;
            }
         }
      }

      try {
         const response = await axios.post(`${BASE_URL}/api/orders`, {
            userId: userInfo._id,
            productId: product._id,
            size: product.selectedSize,
            address: orderDetails.address,
            phoneNumber: orderDetails.phoneNumber,
            pincode: orderDetails.pincode,
            additionalDetails: orderDetails.additionalDetails,
            wantStitched: needStitching,
            ...orderDetails.measurements,
         });
         
         if (response.status === 201) {
            showToast('Order submitted successfully.', 'success');
            setShowOrderModal(false);

            let message = `Hi, I'm interested in ordering:%0A%0A` +
               `Product: ${encodeURIComponent(product.name)}%0A` +
               `ProductID: ${encodeURIComponent(product._id)}%0A`;

            if (product?.selectedSize && product.selectedSize !== 'undefined' && product.selectedSize !== 'null') {
               message += `Size: ${encodeURIComponent(product.selectedSize)}%0A`;
            }

            message += `Price: ₹${encodeURIComponent(product.price)} (%2B50 delivery charge)%0A` +
               `Total: ₹${encodeURIComponent(product.price + 50)}%0A%0A` +
               `Delivery Address:%0A${encodeURIComponent(orderDetails.address)}%0A` +
               `Pincode: ${encodeURIComponent(orderDetails.pincode)}%0A` +
               `Phone Number: ${encodeURIComponent(orderDetails.phoneNumber)}`;

            if (needStitching) {
               message += `%0A%0AMeasurements:%0A` +
                  Object.entries(orderDetails.measurements)
                     .map(([key, value]) => `${key}: ${encodeURIComponent(value)} inch`)
                     .join('%0A');
            }

            const whatsappNumber = '919946289300';  
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
            window.open(whatsappUrl, '_blank');
         }
      } catch (error) {
         console.error('Order submission error:', error);
         showToast('Failed to submit the order. Please try again.', 'error');
      }
   };

   if (!showOrderModal) return null;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
         <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>

            <div className="flex flex-col md:flex-row gap-6">
               <div className="flex-1">
                  <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                     <textarea
                        placeholder='Enter address'
                        className="w-full p-2 border rounded-md"
                        rows="3"
                        value={orderDetails.address}
                        onChange={(e) => handleInputChange(e, 'address')}
                        required
                     />
                  </div>

                  <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                     <input
                        type="tel"
                        maxLength="10"
                        placeholder="Enter 10-digit number"
                        className="w-full p-2 border rounded-md"
                        value={orderDetails.phoneNumber}
                        onChange={(e) => {
                           const value = e.target.value.replace(/\D/g, '');
                           handleInputChange({ target: { value } }, 'phoneNumber');
                        }}
                        required
                     />
                  </div>

                  <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                     <input
                        type="text"
                        maxLength="6"
                        placeholder="Enter Pincode"
                        className="w-full p-2 border rounded-md"
                        value={orderDetails.pincode}
                        onChange={(e) => handleInputChange(e, 'pincode')}
                        required
                     />
                  </div>

                  <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (Optional)</label>
                     <textarea
                        className="w-full p-2 border rounded-md"
                        rows="2"
                        value={orderDetails.additionalDetails}
                        onChange={(e) => handleInputChange(e, 'additionalDetails')}
                     />
                  </div>

                  {product.category === 'Ready-to-stitch Churidar' && (
                     <div className="mb-4">
                        <label className="flex items-center space-x-2">
                           <input
                              type="checkbox"
                              checked={needStitching}
                              onChange={(e) => setNeedStitching(e.target.checked)}
                              className="rounded border-gray-300 text-fuchsia-800 focus:ring-fuchsia-700"
                           />
                           <span>Do you want it to get stitched?</span>
                        </label>
                     </div>
                  )}
               </div>

               {needStitching && (
                  <div className="flex-1 border-l pl-6">
                     <h3 className="font-medium mb-4">Measurements (in inches)</h3>
                     {[
                        { label: 'Length', key: 'length' },
                        { label: 'Chest', key: 'chest' },
                        { label: 'Waist', key: 'waist' },
                        { label: 'Hip', key: 'hip' },
                        { label: 'Arm Fit', key: 'armFit' },
                        { label: 'Sleeve Length', key: 'sleeveLength' },
                        { label: 'Sleeve Width', key: 'sleeveWidth' },
                        { label: 'Back Neck', key: 'backNeck' },
                        { label: 'Front Neck', key: 'frontNeck' },
                     ].map(({ label, key }) => (
                        <div className="mb-4" key={key}>
                           <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                           <input
                              type="number"
                              className="w-full p-2 border rounded-md"
                              value={orderDetails.measurements[key]}
                              onChange={(e) => handleInputChange(e, key, true)}
                              required
                           />
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
               <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-lg"
               >
                  Cancel
               </button>
               <button
                  onClick={handleOrderSubmit}
                  className="px-4 py-2 bg-fuchsia-800 text-gray-100 rounded-lg hover:bg-fuchsia-900"
               >
                  Submit Order
               </button>
            </div>

            {toast.show && <Toast message={toast.message} type={toast.type} />}
         </div>
      </div>
   );
};

export default OrderModal;