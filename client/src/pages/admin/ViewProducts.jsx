import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { productListAction } from "../../Redux/Actions/Product";
import { SpinnerLoading } from "../../components/Spinner";
import EditProductModal from "./EditProductModal";
import DeleteProductModal from "./DeleteProductModal";
import AddProductModal from "./AddProductModal";
import Toast from "../../components/Toast";

const CopyableId = ({ id }) => {
   const [copied, setCopied] = useState(false);

   const handleCopy = () => {
      navigator.clipboard.writeText(id).then(() => {
         setCopied(true);
         setTimeout(() => setCopied(false), 1500);
      });
   };

   return (
      <button
         onClick={handleCopy}
         title="Click to copy"
         className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer select-none"
      >
         {copied ? "Copied!" : id}
      </button>
   );
};

const ViewProducts = () => {
   const { refreshFlag } = useOutletContext();
   const dispatch = useDispatch();
   const location = useLocation();
   const navigate = useNavigate();
   const productListReducer = useSelector((state) => state.productListReducer);
   const { loading, error, products = [] } = productListReducer;

   const [searchTerm, setSearchTerm] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [currentProduct, setCurrentProduct] = useState(null);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [productToDelete, setProductToDelete] = useState(null);
   const [isInitialLoad, setIsInitialLoad] = useState(true);
   const productsPerPage = 10;

   const [toast, setToast] = useState({
      visible: false,
      message: "",
      type: "success",
   });

   // Initialize from URL on mount
   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get("page"));
      if (pageFromUrl && !isNaN(pageFromUrl)) {
         setCurrentPage(pageFromUrl);
      }
      dispatch(productListAction());
      setIsInitialLoad(false);
   }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

   // Fetch on refreshFlag change (skip initial — already fetched above)
   useEffect(() => {
      if (!isInitialLoad) {
         dispatch(productListAction());
      }
   }, [refreshFlag]); // eslint-disable-line react-hooks/exhaustive-deps

   const filteredProducts = useMemo(() => {
      const lowerSearch = searchTerm.toLowerCase().replace(/-/g, "");
      return [...products].reverse().filter(
         (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.productCode &&
               product.productCode.toLowerCase().replace(/-/g, "").includes(lowerSearch)) ||
            product.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [products, searchTerm]);

   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

   const paginate = useCallback(
      (pageNumber) => {
         const validatedPage = Math.min(Math.max(1, pageNumber), totalPages || 1);
         setCurrentPage(validatedPage);
         navigate(`?page=${validatedPage}`, { replace: true });
      },
      [navigate, totalPages]
   );

   // Reset page when searching
   useEffect(() => {
      if (!isInitialLoad && searchTerm) {
         paginate(1);
      }
   }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

   // Clamp page if total pages shrinks
   useEffect(() => {
      if (!isInitialLoad && totalPages > 0 && currentPage > totalPages) {
         paginate(1);
      }
   }, [totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

   const indexOfLastProduct = currentPage * productsPerPage;
   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
   const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

   // Graceful empty-state display values
   const showingFrom = filteredProducts.length === 0 ? 0 : indexOfFirstProduct + 1;
   const showingTo = Math.min(indexOfLastProduct, filteredProducts.length);

   const showToast = (message, type = "success") => {
      setToast({ visible: true, message, type });
      setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
   };

   const closeToast = () => setToast({ visible: false, message: "", type: "success" });

   const handleEditClick = (product) => {
      setCurrentProduct(product);
      setIsEditModalOpen(true);
   };

   const handleAddClick = () => setIsAddModalOpen(true);

   const handleDeleteClick = (product) => {
      setProductToDelete(product);
      setIsDeleteModalOpen(true);
   };

   const closeEditModal = () => {
      setIsEditModalOpen(false);
      setCurrentProduct(null);
   };

   const closeAddModal = () => setIsAddModalOpen(false);

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
      <>
         <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
               <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">

                  {/* Search + Add bar */}
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                     <div className="w-full md:w-1/2">
                        <input
                           type="text"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-600 focus:border-blue-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                           placeholder="Search by name, code, or color..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <button
                        onClick={handleAddClick}
                        className="text-gray-100 bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 transition-colors"
                     >
                        Add Product
                     </button>
                  </div>

                  {/* Table content */}
                  {loading ? (
                     <div className="flex justify-center items-center min-h-[200px]">
                        <SpinnerLoading />
                     </div>
                  ) : error ? (
                     <div className="text-red-500 p-4 text-center">{error}</div>
                  ) : filteredProducts.length === 0 ? (
                     <div className="text-gray-500 dark:text-gray-400 p-8 text-center">
                        No products found.
                     </div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                              <tr>
                                 <th className="px-4 py-3">Product Code</th>
                                 <th className="px-4 py-3 max-w-xs">Product Name</th>
                                 <th className="px-4 py-3">Brand</th>
                                 <th className="px-4 py-3">Color</th>
                                 <th className="px-4 py-3">Stock</th>
                                 <th className="px-4 py-3">Price</th>
                                 <th className="px-4 py-3">Category</th>
                                 <th className="px-4 py-3">Actions</th>
                              </tr>
                           </thead>
                           <tbody>
                              {currentProducts.map((product) => (
                                 <tr
                                    key={product._id}
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                 >
                                    <td className="px-4 py-3">
                                       {product.productCode ? (
                                          <CopyableId id={product.productCode} />
                                       ) : (
                                          <span className="text-gray-400 dark:text-gray-500 italic">—</span>
                                       )}
                                    </td>
                                    <td className="px-4 py-3 max-w-[12rem] truncate font-medium text-gray-900 dark:text-white">
                                       {product.name}
                                    </td>
                                    <td className="px-4 py-3 max-w-[8rem] truncate">{product.brand}</td>
                                    <td className="px-4 py-3">{product.color}</td>
                                    <td className="px-4 py-3">{product.countInStock}</td>
                                    <td className="px-4 py-3">
                                       <span className="font-[inter]">₹</span>
                                       {product.price}
                                    </td>
                                    <td className="px-4 py-3 max-w-[10rem] truncate">{product.category}</td>
                                    <td className="px-4 py-3 min-w-[10rem]">
                                       <div className="flex items-center gap-2">
                                          <button
                                             onClick={() => handleEditClick(product)}
                                             className="px-3 py-1 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                          >
                                             Edit
                                          </button>
                                          <button
                                             onClick={() => handleDeleteClick(product)}
                                             className="px-3 py-1 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                                          >
                                             Delete
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}

                  {/* Pagination */}
                  <nav
                     className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t dark:border-gray-700"
                     aria-label="Table navigation"
                  >
                     <span className="text-sm text-gray-500 dark:text-gray-400">
                        Showing{" "}
                        <strong className="text-gray-900 dark:text-white">
                           {showingFrom}–{showingTo}
                        </strong>{" "}
                        of{" "}
                        <strong className="text-gray-900 dark:text-white">
                           {filteredProducts.length}
                        </strong>{" "}
                        products
                     </span>

                     {totalPages > 1 && (
                        <ul className="inline-flex items-center gap-1 text-sm">
                           <li>
                              <button
                                 onClick={() => paginate(currentPage - 1)}
                                 disabled={currentPage === 1}
                                 className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                 ← Prev
                              </button>
                           </li>

                           {Array.from({ length: totalPages }).map((_, index) => {
                              const page = index + 1;
                              const isEdge = page === 1 || page === totalPages;
                              const isNearCurrent = Math.abs(page - currentPage) <= 1;
                              if (!isEdge && !isNearCurrent) {
                                 if (page === 2 || page === totalPages - 1) {
                                    return (
                                       <li key={index}>
                                          <span className="px-2 py-1 text-gray-400">…</span>
                                       </li>
                                    );
                                 }
                                 return null;
                              }
                              return (
                                 <li key={index}>
                                    <button
                                       onClick={() => paginate(page)}
                                       className={`px-3 py-1 rounded border transition-colors ${currentPage === page
                                          ? "bg-blue-600 text-white border-blue-600"
                                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                          }`}
                                    >
                                       {page}
                                    </button>
                                 </li>
                              );
                           })}

                           <li>
                              <button
                                 onClick={() => paginate(currentPage + 1)}
                                 disabled={currentPage === totalPages}
                                 className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                 Next →
                              </button>
                           </li>
                        </ul>
                     )}
                  </nav>
               </div>
            </div>
         </section>

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
               onSuccess={handleEditSuccess}
               showToast={showToast}
            />
         )}

         <DeleteProductModal
            isOpen={isDeleteModalOpen}
            closeModal={closeDeleteModal}
            product={productToDelete}
            onSuccess={handleDeleteSuccess}
            showToast={showToast}
         />

         {toast.visible && (
            <Toast message={toast.message} type={toast.type} onClose={closeToast} />
         )}
      </>
   );
};

export default ViewProducts;