import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { productListAction } from "../../Redux/Actions/Product";
import { SpinnerLoading } from "../../components/Spinner";
import EditProductModal from "./EditProductModal";
import DeleteProductModal from "./DeleteProductModal";
import AddProductModal from "./AddProductModal";
import Toast from "../../components/Toast";

const ViewProducts = () => {
   const { refreshFlag } = useOutletContext();
   const dispatch = useDispatch();
   const location = useLocation();
   const navigate = useNavigate();
   const productListReducer = useSelector((state) => state.productListReducer);
   const { loading, error, products = [] } = productListReducer;

   const [searchTerm, setSearchTerm] = useState("");
   const [currentPage, setCurrentPage] = useState(() => {
      const params = new URLSearchParams(location.search);
      return parseInt(params.get('page')) || 1;
   });
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [currentProduct, setCurrentProduct] = useState(null);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [productToDelete, setProductToDelete] = useState(null);
   const productsPerPage = 10;
   const [isInitialLoad, setIsInitialLoad] = useState(true);

   const [toast, setToast] = useState({
      visible: false,
      message: "",
      type: "success"
   });

   // Fetch products
   useEffect(() => {
      dispatch(productListAction());
   }, [dispatch, refreshFlag]);

   // Filtered products - memoized to prevent unnecessary recalculations
   const filteredProducts = React.useMemo(() => {
      return [...products]
         .reverse()
         .filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.color.toLowerCase().includes(searchTerm.toLowerCase())
         );
   }, [products, searchTerm]);

   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

   // Handle page navigation
   const paginate = useCallback((pageNumber) => {
      const validatedPage = Math.min(Math.max(1, pageNumber), totalPages || 1);
      setCurrentPage(validatedPage);
      navigate(`?page=${validatedPage}`, { replace: true });
   }, [navigate, totalPages]);

   // Sync with URL on location change and initial load
   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get('page'));
      
      if (isInitialLoad) {
         if (pageFromUrl && !isNaN(pageFromUrl)) {
            setCurrentPage(pageFromUrl);
         }
         setIsInitialLoad(false);
      }
   }, [location.search, isInitialLoad]);

   // Reset page when searching
   useEffect(() => {
      if (!isInitialLoad && searchTerm) {
         paginate(1);
      }
   }, [searchTerm, paginate, isInitialLoad]);

   // Validate current page when total pages changes
   useEffect(() => {
      if (!isInitialLoad && totalPages > 0 && currentPage > totalPages) {
         paginate(1);
      }
   }, [totalPages, currentPage, paginate, isInitialLoad]);

   // Calculate current products
   const indexOfLastProduct = currentPage * productsPerPage;
   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
   const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

   const showToast = (message, type = "success") => {
      setToast({ visible: true, message, type });
      setTimeout(() => {
         setToast({ visible: false, message: "", type: "success" });
      }, 3000);
   };

   const closeToast = () => {
      setToast({ visible: false, message: "", type: "success" });
   };

   const handleEditClick = (product) => {
      setCurrentProduct(product);
      setIsEditModalOpen(true);
   };

   const handleAddClick = () => {
      setIsAddModalOpen(true);
   };

   const handleDeleteClick = (product) => {
      setProductToDelete(product);
      setIsDeleteModalOpen(true);
   };

   const closeEditModal = () => {
      setIsEditModalOpen(false);
      setCurrentProduct(null);
   };

   const closeAddModal = () => {
      setIsAddModalOpen(false);
   };

   const closeDeleteModal = () => {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
   };

   const handleAddSuccess = () => {
      showToast("Product added successfully!");
      closeAddModal();
      dispatch(productListAction());
   };

   const handleEditSuccess = () => {
      showToast("Product updated successfully!");
      closeEditModal();
      dispatch(productListAction());
   };

   const handleDeleteSuccess = () => {
      showToast("Product deleted successfully!");
      closeDeleteModal();
      dispatch(productListAction());
   };

   const handleError = (error) => {
      showToast(error.message || "An error occurred", "error");
   };

   return (
      <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
         <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
               <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                  <div className="w-full md:w-1/2">
                     <form className="flex items-center relative" onSubmit={(e) => e.preventDefault()}>
                        <svg
                           className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-300"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              fillRule="evenodd"
                              d="M10 2a8 8 0 016.32 12.906l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z"
                              clipRule="evenodd"
                           ></path>
                        </svg>
                        <input
                           type="text"
                           className="bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                           placeholder="Search"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </form>
                  </div>

                  <button
                     onClick={handleAddClick}
                     className="text-gray-100 bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2"
                  >
                     Add Product
                  </button>
               </div>

               {loading ? (
                  <SpinnerLoading />
               ) : error ? (
                  <div className="text-red-500">{error}</div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                           <tr>
                              <th className="px-4 py-3">Product ID</th>
                              <th className="px-4 py-3 max-w-xs">Product Name</th>
                              <th className="px-4 py-3 max-w-6">Brand</th>
                              <th className="px-4 py-3">Color</th>
                              <th className="px-4 py-3">Stock</th>
                              <th className="px-4 py-3">Price</th>
                              <th className="px-4 py-3">Category</th>
                              <th className="px-4 py-3">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {currentProducts.map((product) => (
                              <tr key={product._id} className="border-b dark:border-gray-700">
                                 <td className="px-4 py-3">{product._id}</td>
                                 <td className="px-4 py-3 max-w-50">{product.name}</td>
                                 <td className="px-4 py-3 max-w-40">{product.brand}</td>
                                 <td className="px-4 py-3">{product.color}</td>
                                 <td className="px-4 py-3">{product.countInStock}</td>
                                 <td className="px-4 py-3"><span className="font-[inter]">₹</span>{product.price}</td>
                                 <td className="px-4 py-3 max-w-40">{product.category}</td>
                                 <td className="px-4 py-3 min-w-48">
                                    <button
                                       onClick={() => handleEditClick(product)}
                                       className="text-gray-100 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1 mr-2"
                                    >
                                       Edit
                                    </button>
                                    <button
                                       onClick={() => handleDeleteClick(product)}
                                       className="text-gray-100 bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1"
                                    >
                                       Delete
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}

               <nav className="flex justify-between items-center p-4" aria-label="Table navigation">
                  <span>
                     Showing{" "}
                     <strong>
                        {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)}
                     </strong>{" "}
                     of <strong>{filteredProducts.length}</strong>
                  </span>
                  <ul className="inline-flex items-center">
                     <li>
                        <button
                           onClick={() => paginate(currentPage - 1)}
                           disabled={currentPage === 1}
                           className="px-3 py-1 disabled:opacity-50"
                        >
                           Previous
                        </button>
                     </li>
                     {Array.from({ length: totalPages }).map((_, index) => (
                        <li key={index}>
                           <button
                              onClick={() => paginate(index + 1)}
                              className={`px-3 py-1 ${currentPage === index + 1 ? "bg-blue-600 text-gray-100" : ""}`}
                           >
                              {index + 1}
                           </button>
                        </li>
                     ))}
                     <li>
                        <button
                           onClick={() => paginate(currentPage + 1)}
                           disabled={currentPage === totalPages}
                           className="px-3 py-1 disabled:opacity-50"
                        >
                           Next
                        </button>
                     </li>
                  </ul>
               </nav>
            </div>
         </div>

         {isAddModalOpen && (
            <AddProductModal
               isOpen={isAddModalOpen}
               closeModal={closeAddModal}
               onSuccess={handleAddSuccess}
               onError={handleError}
               showToast={showToast}
            />
         )}

         {isEditModalOpen && (
            <EditProductModal
               isOpen={isEditModalOpen}
               closeModal={closeEditModal}
               product={currentProduct}
               showToast={showToast}
            />
         )}

         <DeleteProductModal
            isOpen={isDeleteModalOpen}
            closeModal={closeDeleteModal}
            product={productToDelete}
            showToast={showToast}
         />

         {toast.visible && (
            <Toast
               message={toast.message}
               type={toast.type}
               onClose={closeToast}
            />
         )}
      </section>
   );
};

export default ViewProducts;