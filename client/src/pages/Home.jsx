import { useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { productListAction } from "../Redux/Actions/Product";
import Layout from "../layouts/Layouts";
import { SpinnerLoading } from "../components/Spinner";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

// ─── Helper ───────────────────────────────────────────────────────────────
const getImageSrc = (image) => {
   if (!image) return "/placeholder-image.jpg";
   return image.startsWith("data:") || image.startsWith("http")
      ? image
      : `data:image/jpeg;base64,${image}`;
};

// ─── Product Card ─────────────────────────────────────────────────────────
const ProductCard = ({ product, index }) => (
   <div
      className="group flex flex-col"
      data-aos="fade-up"
      data-aos-delay={index * 80}
   >
      <NavLink
         to={`/products/${product._id}`}
         className="relative aspect-[3/4] overflow-hidden bg-[#f5f0eb] block mb-3 rounded-xl"
      >
         <img
            src={getImageSrc(product.image)}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
            loading="lazy"
            onError={(e) => {
               e.target.onerror = null;
               e.target.src = "/placeholder-image.jpg";
            }}
         />

         {/* Gradient scrim — always present on mobile for legibility */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity duration-400" />

         {/* Desktop hover CTA */}
         <div className="hidden md:flex absolute inset-x-0 bottom-0 pb-4 justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
            <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg tracking-wide uppercase">
               <ShoppingBag className="w-3 h-3" />
               View Details
            </span>
         </div>

         {/* "New" badge */}
         <div className="absolute top-2.5 left-2.5">
            <span className="bg-[#7c2d3e] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
               New
            </span>
         </div>
      </NavLink>

      <div className="px-0.5">
         <h3 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-[15px] line-clamp-2 leading-snug tracking-tight">
            {product.name}
         </h3>
         <p className="mt-1 text-[#7c2d3e] font-bold text-sm md:text-base">
            ₹{product.price?.toLocaleString("en-IN")}
         </p>
      </div>
   </div>
);

// ─── Home ─────────────────────────────────────────────────────────────────
const Home = () => {
   const location = useLocation();
   const dispatch = useDispatch();

   const {
      loading = false,
      error = null,
      products = [],
   } = useSelector((state) => state.productListReducer);

   // AOS: init once only
   useEffect(() => {
      AOS.init({ duration: 800, once: true, offset: 50, easing: "ease-out-cubic" });
   }, []);

   // Fetch only if cache is empty
   useEffect(() => {
      if (products.length === 0) {
         dispatch(productListAction());
      }
   }, [dispatch]);

   // Scroll to top on route change
   useEffect(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
   }, [location.pathname]);

   const showSpinner = loading && products.length === 0;
   const latestProducts = Array.isArray(products) ? products.slice(-4).reverse() : [];

   return (
      <Layout>
         <div className="min-h-screen" style={{ background: "#faf8f5" }}>

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <section
               className="relative overflow-hidden"
               style={{ height: "100svh", minHeight: 560, backgroundColor: "#1c1510" }}
            >
               {/* Background image */}
               <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('images/churidar_1.jpg')" }}
               />

               {/* Layered overlay: darkens bottom & left for text legibility */}
               <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

               {/* Decorative thin line — top */}
               <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg, #cc327d44, #cc327dff, #cc327d44)" }} />

               {/* Content */}
               <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-5 sm:px-8">
                     <div className="max-w-xl" data-aos="fade-up">
                        {/* Eyebrow */}
                        <div className="flex items-center gap-2 mb-5">
                           <div className="h-px w-8" style={{ background: "#cc327dff" }} />
                           <span
                              className="text-[10px] uppercase tracking-[0.25em] font-bold"
                              style={{ color: "#cc327dff" }}
                           >
                              Antony's Boutique
                           </span>
                        </div>

                        <h1
                           className="font-bold text-white leading-[1.08] tracking-tight mb-6"
                           style={{ fontSize: "clamp(2.4rem, 7vw, 4.5rem)" }}
                        >
                           Discover Your<br />
                           <em className="not-italic" style={{ color: "#cc327dff" }}>Perfect Style</em>
                        </h1>

                        <p className="text-gray-300 leading-relaxed mb-8 max-w-sm" style={{ fontSize: "clamp(0.9rem, 2vw, 1.05rem)" }}>
                           Where elegance meets contemporary design. Curated pieces for every occasion.
                        </p>

                        <div className="flex items-center gap-4 flex-wrap">
                           <NavLink
                              to="/shop"
                              className="group inline-flex items-center gap-2.5 font-semibold py-3.5 px-7 rounded-full transition-all duration-200 active:scale-[0.97] text-sm tracking-wide"
                              style={{ background: "#b80b5fff", color: "#fff" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#930b4dff"}
                              onMouseLeave={e => e.currentTarget.style.background = "#b80b5fff"}
                           >
                              Shop Collection
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                           </NavLink>

                        </div>
                     </div>
                  </div>
               </div>

               {/* Scroll hint */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
                  <div className="w-px h-10 bg-white/60" style={{ animation: "scrollHint 1.8s ease-in-out infinite" }} />
               </div>

               {/* Decorative bottom line */}
               <div className="absolute bottom-0 inset-x-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, #b8860b55, transparent)" }} />
            </section>

            {/* ── New Arrivals ──────────────────────────────────────────────── */}
            <section className="py-16 md:py-24 px-5 sm:px-8">
               <div className="container mx-auto max-w-6xl">

                  {/* Section header */}
                  <div className="flex items-end justify-between mb-10 md:mb-14" data-aos="fade-up">
                     <div>
                        <div className="flex items-center gap-2 mb-3">
                           <Sparkles className="w-3.5 h-3.5" style={{ color: "#cc327dff" }} />
                           <span
                              className="text-[10px] uppercase tracking-[0.2em] font-bold"
                              style={{ color: "#cc327dff" }}
                           >
                              Just In
                           </span>
                        </div>
                        <h2
                           className="font-bold text-gray-900 leading-tight tracking-tight"
                           style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}
                        >
                           New Arrivals
                        </h2>
                        <p className="mt-1.5 text-gray-500 text-sm md:text-[15px]">
                           Trendsetting pieces from our latest collection
                        </p>
                     </div>

                     <NavLink
                        to="/shop"
                        className="hidden md:inline-flex items-center gap-2 text-sm font-semibold transition-colors group"
                        style={{ color: "#7c2d3e" }}
                     >
                        View All
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                     </NavLink>
                  </div>

                  {/* Divider */}
                  <div className="h-px mb-10 md:mb-14" style={{ background: "linear-gradient(90deg, #b8860b33, transparent)" }} />

                  {/* Spinner */}
                  {showSpinner && (
                     <div className="flex justify-center py-16">
                        <SpinnerLoading />
                     </div>
                  )}

                  {/* Error */}
                  {error && !showSpinner && (
                     <div className="text-center py-16">
                        <p className="text-red-500 font-medium text-sm">{error}</p>
                        <button
                           onClick={() => dispatch(productListAction())}
                           className="mt-3 text-xs text-gray-400 hover:text-gray-700 underline underline-offset-4 transition-colors"
                        >
                           Try again
                        </button>
                     </div>
                  )}

                  {/* Product Grid — 2 cols on mobile, 4 on desktop */}
                  {!showSpinner && !error && latestProducts.length > 0 && (
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
                        {latestProducts.map((product, i) => (
                           <ProductCard key={product._id} product={product} index={i} />
                        ))}
                     </div>
                  )}

                  {/* Empty state */}
                  {!showSpinner && !error && latestProducts.length === 0 && (
                     <div className="text-center py-20">
                        <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-400 font-medium text-sm">No products available yet</p>
                     </div>
                  )}

                  {/* Mobile view-all */}
                  {latestProducts.length > 0 && (
                     <div className="mt-10 text-center md:hidden">
                        <NavLink
                           to="/shop"
                           className="inline-flex items-center gap-2 text-sm font-semibold group"
                           style={{ color: "#7c2d3e" }}
                        >
                           View All Products
                           <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </NavLink>
                     </div>
                  )}
               </div>
            </section>

         </div>

         {/* ── Keyframes ─────────────────────────────────────────────────── */}
         <style>{`
        @keyframes scrollHint {
          0%, 100% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          40%       { opacity: 1; transform: scaleY(1); transform-origin: top; }
          80%       { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
        }
      `}</style>
      </Layout>
   );
};

export default Home;