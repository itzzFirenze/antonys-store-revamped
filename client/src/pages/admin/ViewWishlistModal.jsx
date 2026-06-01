import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../Redux/Constants/BASE_URL";

const ViewWishlistModal = ({ isOpen, closeModal, userId }) => {
   const [wishlistItems, setWishlistItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const getImageSrc = (image) => {
      if (!image) return null;
      return image.startsWith("data:") || image.startsWith("http")
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

   // FIX: Close on backdrop click
   const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) closeModal();
   };

   // FIX: Close on Escape key
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (e.key === "Escape" && isOpen) closeModal();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
   }, [isOpen, closeModal]);

   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
         onClick={handleBackdropClick}
      >
         <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
               <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                     User Wishlist
                  </h3>
                  {!loading && !error && (
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
                     </p>
                  )}
               </div>
               <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close modal"
                  className="text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white rounded-lg p-1.5 transition-colors"
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

            {/* Modal Body — scrollable */}
            <div className="overflow-y-auto flex-1 p-6">
               {loading ? (
                  <div className="flex flex-col justify-center items-center h-48 gap-3">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                     <p className="text-sm text-gray-500 dark:text-gray-400">Loading wishlist...</p>
                  </div>
               ) : error ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2">
                     <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                     </svg>
                     <p className="text-sm text-red-500">{error}</p>
                  </div>
               ) : wishlistItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3">
                     {/* Empty heart icon */}
                     <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                     <p className="text-sm text-gray-500 dark:text-gray-400">This user's wishlist is empty</p>
                  </div>
               ) : (
                  // FIX: 4-col max grid (5 was too cramped), consistent card height
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                     {wishlistItems.map((item) => (
                        <div
                           key={item._id}
                           className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden flex flex-col border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                        >
                           {/* Product Image */}
                           <div className="h-36 bg-gray-100 dark:bg-gray-600 overflow-hidden">
                              {item.image ? (
                                 <img
                                    src={getImageSrc(item.image)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                       e.target.onerror = null;
                                       e.target.src = "/placeholder-image.jpg";
                                    }}
                                 />
                              ) : (
                                 // FIX: Placeholder when no image instead of collapsing layout
                                 <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                 </div>
                              )}
                           </div>

                           {/* Product Info */}
                           <div className="p-3 flex flex-col flex-1 gap-2">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                                 {item.name}
                              </h4>
                              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 flex-1">
                                 {item.brand && <p><span className="text-gray-400">Brand</span> · {item.brand}</p>}
                                 {item.color && <p><span className="text-gray-400">Color</span> · {item.color}</p>}
                                 {item.category && <p><span className="text-gray-400">Category</span> · {item.category}</p>}
                              </div>
                              {/* FIX: Price at bottom, always aligned */}
                              <p className="text-sm font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-600">
                                 ₹{item.price?.toLocaleString("en-IN")}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 border-t dark:border-gray-700 shrink-0">
               <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm px-5 py-2 transition-colors"
               >
                  Close
               </button>
            </div>

         </div>
      </div>
   );
};

export default ViewWishlistModal;