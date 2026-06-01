import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Toast from "../../components/Toast";
import { BASE_URL } from "../../Redux/Constants/BASE_URL";

const EditProductModal = ({ isOpen, closeModal, product, showToast }) => {
   const { refreshProducts } = useOutletContext();
   const [isUploading, setIsUploading] = useState(false);
   const initialFormData = {
      name: product?.name || "",
      brand: product?.brand || "",
      price: product?.price || "",
      color: product?.color || "",
      category: product?.category || "",
      countInStock: product?.countInStock || "",
      image: product?.image || null,
   };
   const [formData, setFormData] = useState(initialFormData);
   const [imagePreview, setImagePreview] = useState(product?.image || null);
   const [showSizes, setShowSizes] = useState(false);
   const [sizes, setSizes] = useState({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });

   useEffect(() => {
      if (product?.sizes) {
         setSizes(product.sizes);
         setShowSizes(product.category === "Ready-made churidar" || product.category === "Leggings/Pants");
      }
   }, [product]);

   useEffect(() => {
      const total = Object.values(sizes).reduce((sum, count) => sum + count, 0);
      if (showSizes) {
         setFormData((prev) => ({ ...prev, countInStock: total }));
      }
   }, [sizes, showSizes]);

   const handleCategoryChange = (e) => {
      const category = e.target.value;
      const needsSizes = category === "Ready-made churidar" || category === "Leggings/Pants";
      
      setShowSizes(needsSizes);
      
      if (!needsSizes) {
         setSizes({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
         setFormData(prev => ({
            ...prev,
            category,
            countInStock: "",
         }));
      } else {
         setFormData(prev => ({
            ...prev,
            category,
            countInStock: Object.values(sizes).reduce((sum, count) => sum + count, 0),
         }));
      }
   };

   const handleSizeChange = (size, value) => {
      setSizes((prev) => ({ ...prev, [size]: parseInt(value) || 0 }));
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
   };

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setImagePreview(reader.result);
         };
         reader.readAsDataURL(file);
      }
   };

   const handleImageDelete = () => {
      setFormData({ ...formData, image: null });
      setImagePreview(null);
      const fileInput = document.getElementById('image');
      if (fileInput) {
         fileInput.value = '';
      }
   };

   const uploadImageToUploadcare = async (file) => {
      const UPLOADCARE_PUBLIC_KEY = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY;
      const formData = new FormData();
      formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
      formData.append("UPLOADCARE_STORE", "auto");
      formData.append("file", file);

      try {
         const response = await fetch("https://upload.uploadcare.com/base/", {
            method: "POST",
            body: formData,
         });

         if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
         }

         const data = await response.json();
         console.log("Uploadcare response:", data); // Add logging
         
         if (!data.file) {
            throw new Error("No file UUID received from Uploadcare");
         }

         const imageUrl = `https://ucarecdn.com/${data.file}/-/preview/750x1000/`;
         console.log("Generated image URL:", imageUrl); // Add logging
         return imageUrl;
      } catch (error) {
         console.error("Error uploading to Uploadcare:", error);
         showToast(`Upload error: ${error.message}`, "error");
         return null;
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsUploading(true);

      try {
         let imageUrl = formData.image;
         const imageFile = e.target.image.files[0];
         
         if (imageFile) {
            console.log("Uploading new image file:", imageFile.name); // Add logging
            imageUrl = await uploadImageToUploadcare(imageFile);
            
            if (!imageUrl) {
               setIsUploading(false);
               return;
            }
         } else {
            console.log("Using existing image URL:", imageUrl); // Add logging
         }

         const updateData = {
            ...formData,
            image: imageUrl,
            sizes: showSizes ? sizes : undefined
         };

         console.log("Sending update data to API:", updateData); // Add logging

         const response = await fetch(`${BASE_URL}/api/products/${product._id}`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData)
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update product');
         }

         const updatedProduct = await response.json();
         console.log("API response:", updatedProduct); // Add logging

         if (!updatedProduct.image || updatedProduct.image !== imageUrl) {
            console.error("Image URL mismatch:", {
               sent: imageUrl,
               received: updatedProduct.image
            });
         }

         refreshProducts();
         showToast('Product updated successfully!', 'success');
         closeModal();
      } catch (error) {
         console.error('Error updating product:', error);
         showToast(error.message || 'Error updating product', 'error');
      } finally {
         setIsUploading(false);
      }
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
         <div className="relative w-full max-w-2xl bg-white rounded-lg shadow dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Update Product
               </h3>
               <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
               >
                  <svg
                     aria-hidden="true"
                     className="w-5 h-5"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                     />
                  </svg>
                  <span className="sr-only">Close modal</span>
               </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4">
               <div className="grid gap-4 mb-4 sm:grid-cols-2">
                  <div>
                     <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                     >
                        Name
                     </label>
                     <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                        required
                     />
                  </div>
                  <div>
                     <label
                        htmlFor="brand"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                     >
                        Brand
                     </label>
                     <input
                        type="text"
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                        required
                     />
                  </div>
                  <div>
                     <label
                        htmlFor="price"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                     >
                        Price
                     </label>
                     <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                        required
                     />
                  </div>
                  <div>
                     <label
                        htmlFor="color"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                     >
                        Color
                     </label>
                     <input
                        type="text"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                        required
                     />
                  </div>
                  <div>
                     <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Category
                     </label>
                     <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleCategoryChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                        required
                     >
                        <option value="">Select a category</option>
                        <option value="Ready-made churidar">Ready-made Churidar</option>
                        <option value="Ready-to-stitch Churidar">Ready-to-stitch Churidar</option>
                        <option value="Shawl">Shawl</option>
                        <option value="Leggings/Pants">Leggings/Pants</option>
                     </select>
                  </div>

                  {showSizes && (
                     <div className="col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                           Sizes
                        </label>
                        <div className="grid grid-cols-5 gap-4">
                           {Object.entries(sizes).map(([size, count]) => (
                              <div key={size} className="flex flex-col items-center">
                                 <label className="text-sm font-medium mb-1">{size}</label>
                                 <input
                                    type="number"
                                    min="0"
                                    value={count}
                                    onChange={(e) => handleSizeChange(size, e.target.value)}
                                    className="w-full p-2 text-center border rounded"
                                 />
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <div>
                     <label
                        htmlFor="stock"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                     >
                        Stock
                     </label>
                     <input
                        type="number"
                        id="stock"
                        name="countInStock"
                        value={formData.countInStock}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                        readOnly={showSizes}
                        required
                     />
                  </div>
                  <div>
                     <label
                        htmlFor="image"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                     >
                        Image
                     </label>
                     <div className="relative flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <input
                           type="file"
                           id="image"
                           name="image"
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           accept="image/*"
                           onChange={handleImageChange}
                        />
                        {(imagePreview || formData.image) ? (
                           <img
                              src={imagePreview || formData.image}
                              alt="Preview"
                              className="absolute inset-0 object-cover w-full h-full rounded-lg"
                              onError={(e) => {
                                 e.target.onerror = null;
                                 e.target.src = '/placeholder-image.jpg';
                              }}
                           />
                        ) : (
                           <span className="text-sm text-gray-500 dark:text-gray-300">
                              Drag & Drop or Browse
                           </span>
                        )}
                        {(imagePreview || formData.image) && (
                           <button
                              type="button"
                              onClick={handleImageDelete}
                              className="absolute top-2 right-2 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                           >
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24"
                                 stroke="currentColor"
                                 className="w-5 h-5"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                 />
                              </svg>
                           </button>
                        )}
                     </div>
                  </div>
               </div>
               <div className="flex items-center justify-end space-x-4 mt-4">
                  <button
                     type="submit"
                     disabled={isUploading}
                     className={`text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 ${
                        isUploading ? "opacity-50 cursor-not-allowed" : ""
                     }`}
                  >
                     {isUploading ? "Updating..." : "Update Product"}
                  </button>
                  <button
                     type="button"
                     onClick={closeModal}
                     className="text-red-600 border border-red-600 hover:bg-red-600 hover:text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                     Cancel
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default EditProductModal;