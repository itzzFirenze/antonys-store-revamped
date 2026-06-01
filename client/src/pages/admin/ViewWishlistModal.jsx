import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../Redux/Constants/BASE_URL";

const ViewWishlistModal = ({ isOpen, closeModal, userId }) => {
   const [wishlistItems, setWishlistItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const getImageSrc = (image) => {
      if (!image) return null;
      return image.startsWith('data:') || image.startsWith('http')
         ? image
         : `data:image/jpeg;base64,${image}`;
   };

   useEffect(() => {
      const fetchWishlistProducts = async () => {
         try {
            setLoading(true);
            setWishlistItems([]);
            setError(null);

            const wishlistResponse = await fetch(`${BASE_URL}/api/wishlist?userId=${userId}`);
            if (!wishlistResponse.ok) {
               throw new Error(`HTTP error ${wishlistResponse.status}`);
            }
            const wishlistData = await wishlistResponse.json();

            const productPromises = wishlistData.wishlist.map(async (productId) => {
               const productResponse = await fetch(`${BASE_URL}/api/products/${productId}`);
               if (!productResponse.ok) {
                  throw new Error(`Error fetching product ${productId}`);
               }
               return productResponse.json();
            });

            const products = await Promise.all(productPromises);
            setWishlistItems(products);
         } catch (err) {
            console.error("Error fetching wishlist:", err);
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      if (isOpen && userId) {
         fetchWishlistProducts();
      }
   }, [isOpen, userId]);

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
         <div className="relative w-full max-w-4xl bg-white rounded-lg shadow dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  User Wishlist
               </h3>
               <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
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
               {loading ? (
                  <div className="flex justify-center items-center h-40">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
               ) : error ? (
                  <div className="text-red-500 text-center">{error}</div>
               ) : wishlistItems.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                     No items in wishlist
                  </div>
               ) : (
                  <div className="h-96 overflow-y-auto"> {/* Scrollable container */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-8">
                        {wishlistItems.map((item) => (
                           <div
                              key={item._id}
                              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full"
                           >
                              <div className="p-4 flex-grow">
                                 {item.image && (
                                    <div className="relative h-32 mb-4">
                                       <img
                                          src={getImageSrc(item.image)}
                                          alt={item.name}
                                          className="absolute w-full h-full object-cover rounded-lg"
                                          onError={(e) => {
                                             e.target.onerror = null;
                                             e.target.src = '/placeholder-image.jpg';
                                          }}
                                       />
                                    </div>
                                 )}
                                 <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    {item.name}
                                 </h4>
                                 <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <p>Brand: {item.brand}</p>
                                    <p>Color: {item.color}</p>
                                    <p>Category: {item.category}</p>
                                 </div>
                              </div>
                              <div className="p-4 border-t dark:border-gray-700">
                                 <p className="text-sm font-bold text-gray-900 dark:text-white"><span className="font-[inter]">₹</span>{item.price}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t dark:border-gray-600">
               <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-100 bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
               >
                  Close
               </button>
            </div>
         </div>
      </div>
   );
};

export default ViewWishlistModal;