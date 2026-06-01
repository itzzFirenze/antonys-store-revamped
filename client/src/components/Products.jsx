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
   const productListReducer = useSelector((state) => state.productListReducer);
   const { loading, error, products = [] } = productListReducer;

   const [showSpinner, setShowSpinner] = useState(true);
   const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

   // Handle window resize
   useEffect(() => {
      const handleResize = () => {
         setIsMobile(window.innerWidth <= 640);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   // Get initial page from URL query parameter
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

   useEffect(() => {
      sessionStorage.setItem("sortOption", JSON.stringify(sortOption));
   }, [sortOption]);

   useEffect(() => {
      sessionStorage.setItem("selectedCategory", JSON.stringify(selectedCategory));
   }, [selectedCategory]);

   useEffect(() => {
      sessionStorage.setItem("selectedColors", JSON.stringify(selectedColors));
   }, [selectedColors]);

   // Pagination state
   const [currentPage, setCurrentPage] = useState(initialPage);
   const productsPerPage = 28;

   useEffect(() => {
      if (!products.length) {
         setShowSpinner(true);
         dispatch(productListAction()).then(() => {
            setShowSpinner(false);
            const savedScrollPosition = sessionStorage.getItem('productsScrollPosition');
            if (savedScrollPosition !== null) {
               requestAnimationFrame(() => {
                  window.scrollTo(0, parseInt(savedScrollPosition));
               });
            }
         });
      } else {
         setShowSpinner(false);
         const savedScrollPosition = sessionStorage.getItem('productsScrollPosition');
         if (savedScrollPosition !== null) {
            requestAnimationFrame(() => {
               window.scrollTo(0, parseInt(savedScrollPosition));
               sessionStorage.removeItem('productsScrollPosition');
            });
         }
      }
   }, [dispatch, products.length, sortOption, selectedCategory, selectedColors]);

   useEffect(() => {
      const shouldResetPage = sortOption !== null ||
         selectedCategory.length > 0 ||
         selectedColors.length > 0;

      if (shouldResetPage) {
         setCurrentPage(1);
         navigate('?page=1', { replace: true });
      }
   }, [selectedCategory, selectedColors, sortOption, navigate]);

   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get('page')) || 1;
      setCurrentPage(pageFromUrl);
   }, [location.search]);

   const capitalizeFirstLetter = (string) => {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
   };

   const filteredProducts = (Array.isArray(products) ? [...products] : [])
      .reverse()
      .filter((product) =>
         (selectedCategory.length === 0 || selectedCategory.includes(product.category)) &&
         (selectedColors.length === 0 || selectedColors.includes(product.color))
      )
      .sort((a, b) => {
         if (sortOption === "Price: Low to High") return a.price - b.price;
         if (sortOption === "Price: High to Low") return b.price - a.price;
         return 0;
      });

   const getImageSrc = (image) => {
      if (!image) return '';
      return image.startsWith('data:') || image.startsWith('http')
         ? image
         : `data:image/jpeg;base64,${image}`;
   };

   const indexOfLastProduct = currentPage * productsPerPage;
   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
   const paginatedProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

   const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
      navigate(`?page=${pageNumber}`, { replace: true });
      window.scrollTo(0, 0);
   };

   const handlePrevious = () => {
      if (currentPage > 1) {
         const newPage = currentPage - 1;
         setCurrentPage(newPage);
         navigate(`?page=${newPage}`, { replace: true });
         window.scrollTo(0, 0);
      }
   };

   const handleNext = () => {
      if (currentPage < totalPages) {
         const newPage = currentPage + 1;
         setCurrentPage(newPage);
         navigate(`?page=${newPage}`, { replace: true });
         window.scrollTo(0, 0);
      }
   };

   const handleProductClick = (productId) => {
      sessionStorage.setItem('productsScrollPosition', window.scrollY.toString());
      navigate(`/products/${productId}`);
   };

   useEffect(() => {
      if (totalPages > 0 && currentPage > totalPages) {
         setCurrentPage(1);
         navigate('?page=1', { replace: true });
      }
   }, [totalPages, currentPage, navigate]);

   if (error) {
      return <h1>{error}</h1>;
   }

   const DesktopView = () => (
      <>
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
                  <div className="grid grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-4 md:grid-cols-3 lg:grid-cols-4">
                     {paginatedProducts.map((product, index) => (
                        <div
                           key={product._id || index}
                           className="bg-white mb-2 sm:mb-0"
                        >
                           <div className="h-full">
                              <div className="group relative">
                                 <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 relative">
                                    <img
                                       src={getImageSrc(product.image)}
                                       alt="Product"
                                       className={`h-full w-full object-cover group-hover:opacity-75 ${product.countInStock === 0 ? 'opacity-50' : ''}`}
                                       onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/placeholder-image.jpg';
                                       }}
                                    />
                                    {product.countInStock === 0 && (
                                       <div className="absolute -left-14 top-8 w-48 transform -rotate-45 bg-red-600 text-white py-1 text-sm font-bold shadow-lg pl-12">
                                          OUT OF STOCK
                                       </div>
                                    )}
                                 </div>
                                 <div className="mt-4">
                                    <div className="space-y-1">
                                       <h3 className="text-sm text-gray-700 min-h-[40px]">
                                          <Link
                                             to={`/products/${product._id}`}
                                             className="block"
                                             onClick={(e) => {
                                                e.preventDefault();
                                                handleProductClick(product._id);
                                             }}
                                          >
                                             <span aria-hidden="true" className="absolute inset-0"></span>
                                             {capitalizeFirstLetter(product.name)}
                                          </Link>
                                       </h3>
                                       <div className="flex justify-between items-center">
                                          <p className="text-sm text-gray-500">{product.color}</p>
                                          <p className="text-sm font-medium text-gray-900">
                                             <span className="font-[inter]">₹</span>
                                             <span>{product.price}</span>
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </section>

         {filteredProducts.length > 0 && (
            <div className="flex justify-center mt-6 mb-8 px-4">
               <div className="inline-flex items-center gap-2">
                  <button
                     onClick={handlePrevious}
                     disabled={currentPage === 1}
                     className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-fuchsia-800 text-gray-100 hover:bg-fuchsia-900"}`}
                  >
                     &larr; Previous
                  </button>

                  <div className="flex gap-2 overflow-x-auto max-w-[200px] sm:max-w-none px-2">
                     {[...Array(totalPages)].map((_, index) => (
                        <button
                           key={index}
                           onClick={() => handlePageChange(index + 1)}
                           className={`px-3 py-1 rounded ${currentPage === index + 1 ? "bg-fuchsia-800 text-gray-100" : "bg-gray-300 hover:bg-gray-400"}`}
                        >
                           {index + 1}
                        </button>
                     ))}
                  </div>

                  <button
                     onClick={handleNext}
                     disabled={currentPage === totalPages}
                     className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-fuchsia-800 text-gray-100 hover:bg-fuchsia-900"}`}
                  >
                     Next &rarr;
                  </button>
               </div>
            </div>
         )}
      </>
   );

   const MobileView = () => (
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
               <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  {filteredProducts.map((product, index) => (
                     <div
                        key={product._id || index}
                        className="bg-white mb-2"
                     >
                        <div className="h-full">
                           <div className="group relative">
                              <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 relative">
                                 <img
                                    src={getImageSrc(product.image)}
                                    alt="Product"
                                    className={`h-full w-full object-cover group-hover:opacity-75 ${product.countInStock === 0 ? 'opacity-50' : ''}`}
                                    onError={(e) => {
                                       e.target.onerror = null;
                                       e.target.src = '/placeholder-image.jpg';
                                    }}
                                 />
                                 {product.countInStock === 0 && (
                                    <div className="absolute -left-14 top-8 w-48 transform -rotate-45 bg-red-600 text-white py-1 text-sm font-bold shadow-lg pl-12">
                                       OUT OF STOCK
                                    </div>
                                 )}
                              </div>
                              <div className="mt-2">
                                 <h3 className="text-sm text-gray-700 h-[40px] line-clamp-2">
                                    <Link
                                       to={`/products/${product._id}`}
                                       className="block"
                                       onClick={(e) => {
                                          e.preventDefault();
                                          handleProductClick(product._id);
                                       }}
                                    >
                                       <span aria-hidden="true" className="absolute inset-0"></span>
                                       {capitalizeFirstLetter(product.name)}
                                    </Link>
                                 </h3>
                                 <div className="mt-1 flex justify-between items-center h-[20px]">
                                    <p className="text-sm text-gray-500">{product.color}</p>
                                    <p className="text-sm font-medium text-gray-900">
                                       <span className="font-[inter]">₹</span>
                                       <span>{product.price}</span>
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </section>
   );

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

               {isMobile ? <MobileView /> : <DesktopView />}
            </>
         )}
      </div>
   );
};

export default Products;