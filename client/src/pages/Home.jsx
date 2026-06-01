import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { productListAction } from "../Redux/Actions/Product";
import Layout from "../layouts/Layouts";
import { SpinnerLoading } from "../components/Spinner";
import { ArrowRight, ShoppingBag } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const Home = () => {
   const location = useLocation();
   const dispatch = useDispatch();
   const productListReducer = useSelector((state) => state.productListReducer);
   const { loading, error, products = [] } = productListReducer;
   const [showSpinner, setShowSpinner] = useState(true);
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
      dispatch(productListAction());

      const timer = setTimeout(() => {
         setShowSpinner(false);
      }, 500);

      AOS.init({
         duration: 1000,
         once: true
      });

      return () => clearTimeout(timer);
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
            {/* Hero Section */}
            <section
               className="relative bg-cover bg-center h-screen"
               style={{ backgroundImage: "url('images/churidar_1.jpg')" }}
               data-aos="fade-in"
            >
               <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
               <div className="relative h-full container mx-auto px-4 flex items-center">
                  <div className="max-w-2xl space-y-8" data-aos="fade-up" data-aos-delay="300">
                     <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                        Discover Your<br />
                        Perfect Style
                     </h1>
                     <p className="text-lg md:text-xl text-gray-200">
                        Experience luxury fashion at Antony's Boutique. Where elegance meets contemporary design.
                     </p>
                     <NavLink to="/shop">
                        <button className="group flex items-center gap-2 bg-white text-gray-900 py-4 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 text-lg font-medium mt-4">
                           Shop Collection
                           <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </button>
                     </NavLink>
                  </div>
               </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-20 px-4">
               <div className="container mx-auto">
                  <div className="flex items-center justify-between mb-12">
                     <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                           New Arrivals
                        </h2>
                        <p className="mt-2 text-gray-600">
                           Discover our latest collection of trendsetting pieces
                        </p>
                     </div>
                     <NavLink to="/shop">
                        <button className="hidden md:flex items-center gap-2 text-fuchsia-800 hover:text-fuchsia-900 font-medium">
                           View All
                           <ArrowRight className="w-4 h-4" />
                        </button>
                     </NavLink>
                  </div>

                  {(loading || showSpinner) && (
                     <div className="flex justify-center">
                        <SpinnerLoading />
                     </div>
                  )}

                  {mounted && !loading && !showSpinner && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {error ? (
                           <div className="col-span-full text-center text-red-600 py-12">
                              <p className="text-lg">{error}</p>
                           </div>
                        ) : (
                           latestProducts.map((product) => (
                              <div
                                 key={product._id}
                                 className="group relative flex flex-col h-[450px]"
                                 data-aos="fade-up"
                              >
                                 <div className="relative aspect-[3/4] mb-4 rounded-2xl overflow-hidden bg-gray-100">
                                    <img
                                       src={getImageSrc(product.image)}
                                       alt={product.name}
                                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                       onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/placeholder-image.jpg';
                                       }}
                                    />
                                    <NavLink to={`/products/${product._id}`}>
                                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                          <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                                             <ShoppingBag className="w-4 h-4" />
                                             View Details
                                          </button>
                                       </div>
                                    </NavLink>
                                 </div>
                                 <div className="flex flex-col flex-grow">
                                    <h3 className="font-medium text-gray-900 text-lg line-clamp-2 min-h-[56px]">
                                       {product.name}
                                    </h3>
                                    <p className="text-gray-600 mt-auto">
                                       <span className="font-[inter]">₹</span>
                                       <span>{product.price}</span>
                                    </p>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  )}

                  <div className="mt-12 text-center md:hidden">
                     <NavLink to="/shop">
                        <button className="inline-flex items-center gap-2 text-fuchsia-800 hover:text-fuchsia-900 font-medium">
                           View All Products
                           <ArrowRight className="w-4 h-4" />
                        </button>
                     </NavLink>
                  </div>
               </div>
            </section>
         </div>
      </Layout>
   );
};

export default Home;