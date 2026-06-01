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
import { X, ZoomIn, ShieldCheck, RefreshCcw, Truck } from "lucide-react";

// ─── Image Lightbox ────────────────────────────────────────────────────────
const ImageLightbox = ({ src, alt, onLoad }) => {
   const [isOpen, setIsOpen] = useState(false);
   const [isHovered, setIsHovered] = useState(false);

   return (
      <>
         <div
            className="relative w-full h-full flex items-center justify-center cursor-zoom-in group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsOpen(true)}
         >
            <img
               src={src}
               alt={alt}
               className="max-h-[520px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
               onLoad={onLoad}
               onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-image.jpg"; }}
            />
            <div className={`absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-500 text-[11px] font-medium px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
               <ZoomIn className="w-3 h-3" />
               <span>Zoom</span>
            </div>
         </div>

         {isOpen && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setIsOpen(false)}>
               <button className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors p-2" onClick={() => setIsOpen(false)}>
                  <X className="w-6 h-6" />
               </button>
               <img src={src} alt={alt} className="max-w-[88vw] max-h-[88vh] object-contain cursor-zoom-out" onClick={(e) => e.stopPropagation()} />
            </div>
         )}
      </>
   );
};

// ─── Stock Badge ───────────────────────────────────────────────────────────
const StockBadge = ({ inStock }) =>
   inStock ? (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
         In Stock
      </span>
   ) : (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
         <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
         Out of Stock
      </span>
   );


// ─── Main Component ────────────────────────────────────────────────────────
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
   const [activeImage, setActiveImage] = useState(null);
   const [toast, setToast] = useState({ show: false, message: "", type: "error" });

   const showSizesForProduct =
      product?.category === "Ready-made churidar" ||
      product?.category === "Leggings/Pants";

   useEffect(() => {
      if (product?.image) {
         setActiveImage(product.image);
      }
   }, [product]);

   useEffect(() => {
      window.scrollTo(0, 0);
      setIsInitialLoading(true);
      dispatch({ type: "PRODUCT_DETAIL_RESET" });
      dispatch(productAction(id)).finally(() => setIsInitialLoading(false));
      return () => dispatch({ type: "PRODUCT_DETAIL_RESET" });
   }, [dispatch, id]);

   useEffect(() => {
      if (!userInfo) return;
      axios
         .get(`${BASE_URL}/api/wishlist?userId=${userInfo._id}`)
         .then((res) => setIsInWishlist((res.data.wishlist || []).includes(id)))
         .catch(console.error);
   }, [userInfo, id]);

   const showToast = (message, type = "error") => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast({ show: false, message: "", type: "error" }), 4000);
   };

   const handleWishlistToggle = async () => {
      if (!userInfo) { showToast("Please log in to add this product to wishlist"); return; }
      try {
         if (isInWishlist) {
            await axios.delete(`${BASE_URL}/api/wishlist/${id}`, { data: { userId: userInfo._id } });
            setIsInWishlist(false);
         } else {
            await axios.post(`${BASE_URL}/api/wishlist`, { userId: userInfo._id, productId: id });
            setIsInWishlist(true);
         }
      } catch (err) { console.error(err); }
   };

   const getImageSrc = (image) => {
      if (!image) return "/placeholder-image.jpg";
      return image.startsWith("data:") || image.startsWith("http")
         ? image
         : `data:image/jpeg;base64,${image}`;
   };

   const isOutOfStock = showSizesForProduct
      ? Object.values(product?.sizes || {}).every((c) => c === 0)
      : product?.countInStock === 0;

   if (loading || isInitialLoading)
      return (
         <Layout>
            <div className="fixed inset-0 flex items-center justify-center bg-white">
               <Spinner />
            </div>
         </Layout>
      );

   if (error)
      return (
         <Layout>
            <div className="fixed inset-0 flex items-center justify-center">
               <p className="text-red-500 text-sm">{error}</p>
            </div>
         </Layout>
      );

   return (
      <Layout>
         {toast.show && (
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "", type: "error" })} />
         )}

         <div className="min-h-screen bg-[#fafaf9] pt-28 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
               <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col md:flex-row">

                  {/* ── Image Panel ─────────────────────────────────────── */}
                  {/* ── Image Panel ─────────────────────────────────────── */}
                  <div className="relative w-full md:w-[46%] bg-[#f5f3f0] flex flex-row min-h-[420px]">

                     {/* Vertical thumbnail strip */}
                     {product?.images && product.images.length > 1 && (
                        <div className="flex flex-col gap-2 p-3 border-r border-gray-200 items-center justify-center hide-scrollbar overflow-y-auto">
                           {product.images.map((img, idx) => (
                              <button
                                 key={idx}
                                 onClick={() => setActiveImage(img)}
                                 className={`relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 ${(activeImage || product.image) === img
                                    ? "ring-2 ring-fuchsia-900 ring-offset-1 scale-105"
                                    : "opacity-60 hover:opacity-100 border border-gray-200"
                                    }`}
                              >
                                 <img
                                    src={getImageSrc(img)}
                                    alt={`${product.name} thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                 />
                              </button>
                           ))}
                        </div>
                     )}

                     {/* Main image — never resizes regardless of thumbnail presence */}
                     <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                        {imageLoading && (
                           <div className="absolute inset-0 flex items-center justify-center">
                              <Spinner size="lg" />
                           </div>
                        )}
                        <ImageLightbox
                           src={getImageSrc(activeImage || product.image)}
                           alt={product.name}
                           onLoad={() => setImageLoading(false)}
                        />
                     </div>

                  </div>

                  {/* ── Details Panel ───────────────────────────────────── */}
                  <div className="w-full md:w-[54%] px-7 py-7 flex flex-col">

                     {/* Brand + stock */}
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold">
                           {product.brand}
                        </span>
                        <StockBadge inStock={!isOutOfStock} />
                     </div>

                     {/* Name */}
                     <h1
                        className="text-2xl md:text-[1.65rem] leading-snug font-semibold text-gray-900 mb-3"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                     >
                        {product.name}
                     </h1>

                     {/* Price row — directly under name for visual anchor */}
                     <div className="flex items-baseline gap-2 mb-4">
                        <span
                           className={`text-2xl font-bold tracking-tight ${isOutOfStock ? "text-gray-300 line-through" : "text-fuchsia-900"}`}
                           style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                           ₹{product.price}
                        </span>
                        {!isOutOfStock && (
                           <span className="text-xs text-gray-400">+ ₹50 delivery</span>
                        )}
                     </div>

                     <hr className="border-t border-gray-100 mb-4" />

                     {/* Meta grid */}
                     <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
                        {[
                           { label: "Category", value: product.category },
                           { label: "Color", value: product.color },
                           ...(!showSizesForProduct
                              ? [{ label: "Availability", value: `${product.countInStock} units left` }]
                              : []),
                        ].map(({ label, value }) => (
                           <div key={label} className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{label}</span>
                              <span className="text-sm font-medium text-gray-800">{value}</span>
                           </div>
                        ))}
                     </div>

                     {/* Size selector */}
                     {showSizesForProduct && product.sizes && (
                        <>
                           <hr className="border-t border-gray-100 mb-4" />
                           <div className="mb-4">
                              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">
                                 Select Size
                              </p>
                              <div className="flex flex-wrap gap-2">
                                 {Object.entries(product.sizes).map(([size, count]) => {
                                    const unavailable = count === 0;
                                    const active = selectedSize === size;
                                    return (
                                       <button
                                          key={size}
                                          onClick={() => !unavailable && setSelectedSize(size)}
                                          disabled={unavailable}
                                          className={`relative w-12 h-12 rounded-xl text-sm font-semibold transition-all duration-200
                              ${unavailable
                                                ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-dashed border-gray-200"
                                                : active
                                                   ? "bg-fuchsia-900 text-white border-2 border-fuchsia-900 shadow-md scale-105"
                                                   : "bg-white text-gray-700 border border-gray-200 hover:border-fuchsia-700 hover:text-fuchsia-800"
                                             }`}
                                       >
                                          {size}
                                          {unavailable && (
                                             <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <svg className="w-full h-full absolute" viewBox="0 0 48 48">
                                                   <line x1="8" y1="40" x2="40" y2="8" stroke="#d1d5db" strokeWidth="1.5" />
                                                </svg>
                                             </span>
                                          )}
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>
                        </>
                     )}

                     <hr className="border-t border-gray-100 mb-4" />

                     {/* Wishlist CTA */}
                     <div className="flex items-center gap-3">
                        <AnimatedWishlistButton
                           isInWishlist={isInWishlist}
                           onToggle={handleWishlistToggle}
                           disabled={isOutOfStock}
                        />
                     </div>
                  </div>

               </div>
            </div>
         </div>
      </Layout>
   );
}

export default ProductDetail;