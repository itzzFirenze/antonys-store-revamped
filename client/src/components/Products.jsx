import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { productListAction } from '../Redux/Actions/Product';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SpinnerLoading } from "./Spinner";
import Filter from "./Filter";

const Products = () => {
   const dispatch = useDispatch();
   const location = useLocation();
   const navigate = useNavigate();
   const { loading, error, products = [] } = useSelector((state) => state.productListReducer);

   const [showSpinner, setShowSpinner] = useState(true);

   const queryParams = new URLSearchParams(location.search);
   const initialPage = parseInt(queryParams.get('page')) || 1;

   const [sortOption, setSortOption] = useState(
      JSON.parse(sessionStorage.getItem("sortOption")) || null
   );
   const [selectedCategory, setSelectedCategory] = useState(
      JSON.parse(sessionStorage.getItem("selectedCategory")) || []
   );
   const [selectedColors, setSelectedColors] = useState(
      JSON.parse(sessionStorage.getItem("selectedColors")) || []
   );
   const [currentPage, setCurrentPage] = useState(initialPage);

   const productsPerPage = 28;

   // Persist filters to sessionStorage
   useEffect(() => {
      sessionStorage.setItem("sortOption", JSON.stringify(sortOption));
   }, [sortOption]);
   useEffect(() => {
      sessionStorage.setItem("selectedCategory", JSON.stringify(selectedCategory));
   }, [selectedCategory]);
   useEffect(() => {
      sessionStorage.setItem("selectedColors", JSON.stringify(selectedColors));
   }, [selectedColors]);

   // Fetch products + restore scroll
   useEffect(() => {
      if (!products.length) {
         setShowSpinner(true);
         dispatch(productListAction()).then(() => {
            setShowSpinner(false);
            restoreScroll();
         });
      } else {
         setShowSpinner(false);
         restoreScroll();
      }
   }, [dispatch, products.length]);

   const restoreScroll = () => {
      const saved = sessionStorage.getItem('productsScrollPosition');
      if (saved !== null) {
         requestAnimationFrame(() => {
            window.scrollTo(0, parseInt(saved));
            sessionStorage.removeItem('productsScrollPosition');
         });
      }
   };

   // Reset to page 1 when filters change
   useEffect(() => {
      if (sortOption !== null || selectedCategory.length > 0 || selectedColors.length > 0) {
         setCurrentPage(1);
         navigate('?page=1', { replace: true });
      }
   }, [selectedCategory, selectedColors, sortOption]);

   // Sync page from URL
   useEffect(() => {
      const page = parseInt(new URLSearchParams(location.search).get('page')) || 1;
      setCurrentPage(page);
   }, [location.search]);

   const capitalizeFirstLetter = (str) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

   const getImageSrc = (image) => {
      if (!image) return '';
      return image.startsWith('data:') || image.startsWith('http')
         ? image
         : `data:image/jpeg;base64,${image}`;
   };

   const filteredProducts = (Array.isArray(products) ? [...products] : [])
      .reverse()
      .filter((p) =>
         (selectedCategory.length === 0 || selectedCategory.includes(p.category)) &&
         (selectedColors.length === 0 || selectedColors.includes(p.color))
      )
      .sort((a, b) => {
         if (sortOption === "Price: Low to High") return a.price - b.price;
         if (sortOption === "Price: High to Low") return b.price - a.price;
         return 0;
      });

   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
   const indexOfFirst = (currentPage - 1) * productsPerPage;
   const paginatedProducts = filteredProducts.slice(indexOfFirst, indexOfFirst + productsPerPage);

   // Guard against currentPage being out of range after filter change
   useEffect(() => {
      if (totalPages > 0 && currentPage > totalPages) {
         setCurrentPage(1);
         navigate('?page=1', { replace: true });
      }
   }, [totalPages, currentPage]);

   const goToPage = (page) => {
      setCurrentPage(page);
      navigate(`?page=${page}`, { replace: true });
      window.scrollTo(0, 0);
   };

   const handleProductClick = (productId) => {
      sessionStorage.setItem('productsScrollPosition', window.scrollY.toString());
      navigate(`/products/${productId}`);
   };

   if (error) return <h1>{error}</h1>;

   return (
      <div>
         {showSpinner ? (
            <SpinnerLoading />
         ) : (
            <>
               <Filter
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedColors={selectedColors}
                  setSelectedColors={setSelectedColors}
               />

               <section className="text-gray-600 body-font">
                  <div className="container px-4 py-8 mx-auto">

                     {filteredProducts.length === 0 ? (
                        <div className="text-center py-8 px-4 mx-auto max-w-sm">
                           <p className="text-gray-500 text-base">
                              No products match your current filters.
                           </p>
                           <p className="text-gray-400 mt-2 text-sm">
                              Try adjusting your filter criteria or clearing some filters.
                           </p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-y-5 md:grid-cols-3 lg:grid-cols-4">
                           {paginatedProducts.map((product, index) => (
                              <div key={product._id || index} className="bg-white">
                                 <div className="group relative">

                                    {/* Image */}
                                    <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 relative">
                                       <img
                                          src={getImageSrc(product.image)}
                                          alt={capitalizeFirstLetter(product.name)}
                                          className={`h-full w-full object-cover transition-opacity group-hover:opacity-75 ${product.countInStock === 0 ? 'opacity-50' : ''
                                             }`}
                                          onError={(e) => {
                                             e.target.onerror = null;
                                             e.target.src = '/placeholder-image.jpg';
                                          }}
                                       />
                                       {product.countInStock === 0 && (
                                          <div className="absolute -left-14 top-8 w-48 -rotate-45 bg-red-600 text-white py-1 text-sm font-bold shadow-lg pl-12">
                                             OUT OF STOCK
                                          </div>
                                       )}
                                    </div>

                                    {/* Info */}
                                    <div className="mt-3 space-y-1">
                                       <h3 className="text-sm text-gray-700 min-h-[40px] line-clamp-2">
                                          <Link
                                             to={`/products/${product._id}`}
                                             onClick={(e) => {
                                                e.preventDefault();
                                                handleProductClick(product._id);
                                             }}
                                          >
                                             {/* Stretches click area over entire card */}
                                             <span aria-hidden="true" className="absolute inset-0" />
                                             {capitalizeFirstLetter(product.name)}
                                          </Link>
                                       </h3>
                                       <div className="flex justify-between items-center">
                                          <p className="text-sm text-gray-500">{product.color}</p>
                                          <p className="text-sm font-medium text-gray-900">
                                             <span className="font-[inter]">₹</span>
                                             {product.price}
                                          </p>
                                       </div>
                                    </div>

                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </section>

               {/* Pagination — same for all screen sizes */}
               {filteredProducts.length > 0 && (
                  <div className="flex justify-center mt-6 mb-8 px-4">
                     <div className="inline-flex items-center gap-2">
                        <button
                           onClick={() => goToPage(currentPage - 1)}
                           disabled={currentPage === 1}
                           className={`px-3 py-1 rounded ${currentPage === 1
                                 ? "bg-gray-300 cursor-not-allowed"
                                 : "bg-fuchsia-800 text-gray-100 hover:bg-fuchsia-900"
                              }`}
                        >
                           ← Previous
                        </button>

                        <div className="flex gap-2 overflow-x-auto max-w-[200px] sm:max-w-none px-2">
                           {[...Array(totalPages)].map((_, i) => (
                              <button
                                 key={i}
                                 onClick={() => goToPage(i + 1)}
                                 className={`px-3 py-1 rounded ${currentPage === i + 1
                                       ? "bg-fuchsia-800 text-gray-100"
                                       : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                              >
                                 {i + 1}
                              </button>
                           ))}
                        </div>

                        <button
                           onClick={() => goToPage(currentPage + 1)}
                           disabled={currentPage === totalPages}
                           className={`px-3 py-1 rounded ${currentPage === totalPages
                                 ? "bg-gray-300 cursor-not-allowed"
                                 : "bg-fuchsia-800 text-gray-100 hover:bg-fuchsia-900"
                              }`}
                        >
                           Next →
                        </button>
                     </div>
                  </div>
               )}
            </>
         )}
      </div>
   );
};

export default Products;