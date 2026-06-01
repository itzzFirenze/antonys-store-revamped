import { useEffect, useState } from "react";
import { useLocation, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { productListAction } from "../Redux/Actions/Product";
import Layout from "../layouts/Layouts";
import { SpinnerLoading } from "../components/Spinner";
import { ArrowRight, ShoppingBag } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const Home = () => {
   const location = useLocation();
   const dispatch = useDispatch();
   const { loading, error, products = [] } = useSelector((state) => state.productListReducer);

   // Only show spinner if we're actually loading with no cached data
   const showSpinner = loading && products.length === 0;

   useEffect(() => {
      // Skip fetch if products already cached in Redux
      if (!products.length) {
         dispatch(productListAction());
      }

      AOS.init({ duration: 1000, once: true });
   }, [dispatch]);

   useEffect(() => {
      window.scrollTo(0, 0);
   }, [location]);

   const getImageSrc = (image) => {
      if (!image) return '/placeholder-image.jpg';
      return image.startsWith('data:') || image.startsWith('http')
         ? image
         : `data:image/jpeg;base64,${image}`;
   };

   const latestProducts = Array.isArray(products) ? products.slice(-4).reverse() : [];

   return (
      <Layout>
         <div className="min-h-screen bg-gray-50">

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section
               className="relative bg-cover bg-center h-screen"
               style={{ backgroundImage: "url('images/churidar_1.jpg')" }}
               data-aos="fade-in"
            >
               <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
               <div className="relative h-full container mx-auto px-4 flex items-center">
                  <div className="max-w-2xl space-y-8" data-aos="fade-up" data-aos-delay="300">
                     <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                        Discover Your<br />Perfect Style
                     </h1>
                     <p className="text-lg md:text-xl text-gray-200">
                        Experience luxury fashion at Antony's Boutique. Where elegance meets contemporary design.
                     </p>
                     <NavLink
                        to="/shop"
                        className="group inline-flex items-center gap-2 bg-white text-gray-900 py-4 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 text-lg font-medium mt-4"
                     >
                        Shop Collection
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                     </NavLink>
                  </div>
               </div>
            </section>

            {/* ── New Arrivals ──────────────────────────────────────── */}
            <section className="py-20 px-4">
               <div className="container mx-auto">

                  {/* Header */}
                  <div className="flex items-center justify-between mb-12">
                     <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">New Arrivals</h2>
                        <p className="mt-2 text-gray-600">Discover our latest collection of trendsetting pieces</p>
                     </div>
                     <NavLink
                        to="/shop"
                        className="hidden md:inline-flex items-center gap-2 text-fuchsia-800 hover:text-fuchsia-900 font-medium"
                     >
                        View All
                        <ArrowRight className="w-4 h-4" />
                     </NavLink>
                  </div>

                  {/* Spinner */}
                  {showSpinner && (
                     <div className="flex justify-center py-12">
                        <SpinnerLoading />
                     </div>
                  )}

                  {/* Error */}
                  {error && (
                     <div className="text-center text-red-600 py-12">
                        <p className="text-lg">{error}</p>
                     </div>
                  )}

                  {/* Grid — 2 cols mobile, 2 cols tablet, 4 cols desktop */}
                  {!showSpinner && !error && (
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {latestProducts.map((product) => (
                           <div
                              key={product._id}
                              className="group flex flex-col"
                              data-aos="fade-up"
                           >
                              {/* Image */}
                              <NavLink to={`/products/${product._id}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 block mb-3">
                                 <img
                                    src={getImageSrc(product.image)}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                       e.target.onerror = null;
                                       e.target.src = '/placeholder-image.jpg';
                                    }}
                                 />
                                 {/* Hover overlay — hidden on mobile (no hover), visible md+ */}
                                 <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 text-sm">
                                       <ShoppingBag className="w-4 h-4" />
                                       View Details
                                    </span>
                                 </div>
                              </NavLink>

                              {/* Info */}
                              <h3 className="font-medium text-gray-900 text-sm md:text-lg line-clamp-2 leading-snug">
                                 {product.name}
                              </h3>
                              <p className="text-gray-600 mt-1 text-sm md:text-base">
                                 <span className="font-[inter]">₹</span>
                                 {product.price}
                              </p>
                           </div>
                        ))}
                     </div>
                  )}

                  {/* Mobile view-all link */}
                  <div className="mt-12 text-center md:hidden">
                     <NavLink
                        to="/shop"
                        className="inline-flex items-center gap-2 text-fuchsia-800 hover:text-fuchsia-900 font-medium"
                     >
                        View All Products
                        <ArrowRight className="w-4 h-4" />
                     </NavLink>
                  </div>

               </div>
            </section>

         </div>
      </Layout>
   );
};

export default Home;