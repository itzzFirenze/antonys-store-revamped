import { useParams } from "react-router-dom";
import Layout from "../layouts/Layouts";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { productAction } from "../Redux/Actions/Product";
import { Spinner } from "flowbite-react";
import AnimatedWishlistButton from "../components/animatedWishButton";
import axios from "axios";
import Toast from "../components/Toast";
import { BASE_URL } from "../Redux/Constants/BASE_URL";
import { Maximize2 } from 'lucide-react';

// ImageMagnifier Component
const ImageMagnifier = ({ src, alt, onLoad, imageLoading }) => {
   const [showMagnifier, setShowMagnifier] = useState(false);
   const [isZoomed, setIsZoomed] = useState(false);

   const handleMouseEnter = () => {
      setShowMagnifier(true);
   };

   const handleMouseLeave = () => {
      setShowMagnifier(false);
   };

   const handleImageClick = () => {
      setIsZoomed(!isZoomed);
   };

   return (
      <div className="relative w-full h-full flex items-center justify-center">
         {/* Regular image view */}
         <div
            className="relative flex items-center justify-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
         >
            <img
               src={src}
               alt={alt}
               className={`max-h-[400px] w-auto object-contain rounded-lg cursor-zoom-in transition-all duration-300 ${
                  isZoomed ? 'opacity-0' : 'opacity-100'
               }`}
               onClick={handleImageClick}
               onLoad={onLoad}
               onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
               }}
            />

            {/* Magnifier icon overlay */}
            {showMagnifier && !isZoomed && (
               <div className="absolute top-4 right-4 bg-black/60 p-2.5 rounded-full shadow-lg hover:bg-black/70 transition-colors">
                  <Maximize2 className="w-6 h-6 text-white" />
               </div>
            )}
         </div>

         {/* Zoomed view */}
         {isZoomed && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
               onClick={handleImageClick}
            >
               <img
                  src={src}
                  alt={alt}
                  className="max-w-[90vw] max-h-[90vh] object-contain cursor-zoom-out"
               />
            </div>
         )}
      </div>
   );
};

// Main ProductDetail Component
function ProductDetail() {
   const { id } = useParams();
   const dispatch = useDispatch();
   const productReducer = useSelector((state) => state.productReducer);
   const userLoginReducer = useSelector((state) => state.userLoginReducer);
   const { loading, error, product } = productReducer;
   const { userInfo } = userLoginReducer;

   const [imageLoading, setImageLoading] = useState(true);
   const [isInWishlist, setIsInWishlist] = useState(false);
   const [isInitialLoading, setIsInitialLoading] = useState(true);
   const [selectedSize, setSelectedSize] = useState(null);

   const [toast, setToast] = useState({
      show: false,
      message: '',
      type: 'error'
   });

   const showSizesForProduct = product?.category === "Ready-made churidar" ||
      product?.category === "Leggings/Pants";

   useEffect(() => {
      window.scrollTo(0, 0);
      setIsInitialLoading(true);

      dispatch({ type: 'PRODUCT_DETAIL_RESET' });

      dispatch(productAction(id)).finally(() => {
         setIsInitialLoading(false);
      });

      return () => {
         dispatch({ type: 'PRODUCT_DETAIL_RESET' });
      };
   }, [dispatch, id]);

   useEffect(() => {
      const fetchWishlistState = async () => {
         if (userInfo) {
            try {
               const response = await axios.get(
                  `${BASE_URL}/api/wishlist?userId=${userInfo._id}`
               );
               const wishlist = response.data.wishlist || [];
               setIsInWishlist(wishlist.includes(id));
            } catch (error) {
               console.error("Error fetching wishlist state:", error);
            }
         }
      };

      fetchWishlistState();
   }, [userInfo, id]);

   const showToast = (message, type = 'error') => {
      setToast({
         show: true,
         message: message,
         type: type
      });

      setTimeout(() => {
         setToast({ show: false, message: '', type: 'error' });
      }, 4000);
   };

   const handleWishlistToggle = async () => {
      if (!userInfo) {
         showToast('Please log in to add this product to wishlist');
         return;
      }

      try {
         if (isInWishlist) {
            await axios.delete(`${BASE_URL}/api/wishlist/${id}`, {
               data: { userId: userInfo._id },
            });
            setIsInWishlist(false);
         } else {
            await axios.post(`${BASE_URL}/api/wishlist`, {
               userId: userInfo._id,
               productId: id,
            });
            setIsInWishlist(true);
         }
      } catch (error) {
         console.error("Error toggling wishlist state:", error);
      }
   };

   const handleSizeSelect = (size) => {
      setSelectedSize(size);
   };


   const handleCloseToast = () => {
      setToast({ show: false, message: '', type: 'error' });
   };

   const handleImageLoad = () => setImageLoading(false);

   const getImageSrc = (image) => {
      if (!image) return '/placeholder-image.jpg';
      return image.startsWith('data:') || image.startsWith('http')
         ? image
         : `data:image/jpeg;base64,${image}`;
   };

   const SizeSelector = () => {
      if (!showSizesForProduct || !product.sizes) return null;

      return (
         <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Select Size</h3>
            <div className="flex flex-wrap gap-3">
               {Object.entries(product.sizes).map(([size, count]) => (
                  <button
                     key={size}
                     onClick={() => handleSizeSelect(size)}
                     disabled={count === 0}
                     className={`
                        px-4 py-2 rounded-lg border-2 transition-all duration-200
                        ${count === 0
                           ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                           : selectedSize === size
                              ? 'bg-fuchsia-800 text-white border-fuchsia-800 hover:bg-fuchsia-900'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-fuchsia-800'
                        }
                     `}
                  >
                     <span className="font-medium">{size}</span>
                  </button>
               ))}
            </div>
         </div>
      );
   };

   const isOutOfStock = showSizesForProduct
      ? Object.values(product.sizes || {}).every(count => count === 0)
      : product?.countInStock === 0;

   if (loading || isInitialLoading) return (
      <Layout>
         <div className="fixed inset-0 flex items-center justify-center bg-white">
            <Spinner />
         </div>
      </Layout>
   );

   if (error) return (
      <Layout>
         <div className="fixed inset-0 flex items-center justify-center">
            <h1 className="text-red-500">{error}</h1>
         </div>
      </Layout>
   );

   return (
      <Layout>
         {toast.show && (
            <Toast
               message={toast.message}
               type={toast.type}
               onClose={handleCloseToast}
            />
         )}
         <div className="container mx-auto px-4 mt-32">
            <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-xl overflow-hidden">
               {/* Product Image Section */}
               <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-4 relative">
                  {imageLoading && (
                     <div className="absolute inset-0 flex justify-center items-center bg-gray-200 bg-opacity-50">
                        <Spinner size="xl" />
                     </div>
                  )}
                  <ImageMagnifier
                     src={getImageSrc(product.image)}
                     alt={product.name}
                     onLoad={handleImageLoad}
                     imageLoading={imageLoading}
                  />
               </div>

               {/* Product Details Section */}
               <div className="w-full md:w-1/2 p-6 space-y-4">
                  <div>
                     <span className="text-sm text-gray-500 uppercase tracking-wide">
                        Brand: {product.brand}
                     </span>
                     <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                        {product.name}
                     </h1>
                  </div>

                  <div className="space-y-2">
                     <p className="text-gray-600">Color: {product.color}</p>
                     <p className="text-gray-600">Category: {product.category}</p>
                     <p className={isOutOfStock ? "text-red-500 font-medium" : "text-gray-600"}>
                        {isOutOfStock ? "Out of stock" : `In stock: ${product.countInStock}`}
                     </p>
                  </div>

                  <SizeSelector />

                  <div className="space-y-1">
                     <div className={`text-2xl md:text-3xl font-bold text-fuchsia-800 ${isOutOfStock ? "line-through" : ""}`}>
                        <span className="font-[inter]">₹</span>
                        <span>{product.price}</span>
                     </div>
                     {!isOutOfStock && (
                        <p className="text-sm text-gray-500">+<span className="font-[inter]">₹</span>50 for delivery charges</p>
                     )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                     <AnimatedWishlistButton
                        isInWishlist={isInWishlist}
                        onToggle={handleWishlistToggle}
                        disabled={isOutOfStock}
                     />
                  </div>
               </div>
            </div>
         </div>


      </Layout>
   );
}

export default ProductDetail;