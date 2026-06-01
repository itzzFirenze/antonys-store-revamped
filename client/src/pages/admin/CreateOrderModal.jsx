import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../Redux/Constants/BASE_URL";
import Toast from "../../components/Toast";

const CreateOrderModal = ({ isOpen, closeModal, onOrderCreated }) => {
   const [products, setProducts] = useState([]);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [toast, setToast] = useState({ show: false, message: '', type: '' });
   const [productSearch, setProductSearch] = useState("");
   const [showDropdown, setShowDropdown] = useState(false);

   const [formData, setFormData] = useState({
      productId: "",
      size: "",
      customerName: "",
      customerEmail: "",
      phoneNumber: "",
      address: "",
      pincode: "",
      additionalDetails: "",
      wantStitched: false,
      length: "", chest: "", waist: "", hip: "", armFit: "", sleeveLength: "", sleeveWidth: "", backNeck: "", frontNeck: ""
   });

   useEffect(() => {
      if (isOpen) {
         fetchProducts();
      }
   }, [isOpen]);

   const fetchProducts = async () => {
      try {
         const { data } = await axios.get(`${BASE_URL}/api/products`);
         setProducts(data);
      } catch (error) {
         showToast("Failed to fetch products", "error");
      }
   };

   const showToast = (message, type = 'error') => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
   };

   const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: type === 'checkbox' ? checked : value
      }));
   };

   const filteredProducts = products.filter(p => {
      const term = productSearch.toLowerCase().replace(/-/g, '');
      return (p.productCode && p.productCode.toLowerCase().replace(/-/g, '').includes(term)) ||
             p.name.toLowerCase().includes(productSearch.toLowerCase());
   });

   const handleProductSelect = (product) => {
      setFormData(prev => ({ ...prev, productId: product._id, size: "" }));
      setProductSearch(product.productCode ? `${product.productCode} - ${product.name}` : product.name);
      setShowDropdown(false);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
         const { data } = await axios.post(`${BASE_URL}/api/orders/admin-create`, formData);
         showToast(data.message || "Order created successfully", "success");
         setTimeout(() => {
            onOrderCreated();
            closeModal();
            setFormData({
               productId: "", size: "", customerName: "", customerEmail: "", phoneNumber: "", address: "", pincode: "", additionalDetails: "", wantStitched: false, length: "", chest: "", waist: "", hip: "", armFit: "", sleeveLength: "", sleeveWidth: "", backNeck: "", frontNeck: ""
            });
            setProductSearch("");
         }, 1000);
      } catch (error) {
         showToast(error.response?.data?.message || "Error creating order", "error");
      } finally {
         setIsSubmitting(false);
      }
   };

   if (!isOpen) return null;

   const selectedProduct = products.find(p => p._id === formData.productId);
   const showSizes = selectedProduct && (selectedProduct.category === "Ready-made churidar" || selectedProduct.category === "Leggings/Pants");

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
         <div className="relative w-full max-w-4xl bg-white rounded-lg shadow dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create Manual Order
               </h3>
               <button onClick={closeModal} className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 dark:hover:bg-gray-600 dark:hover:text-white">
                  <span className="sr-only">Close modal</span>
                  &times;
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
               <div className="grid gap-4 mb-4 sm:grid-cols-2">
                  <div>
                     <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Customer Name *</label>
                     <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                     <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Customer Email</label>
                     <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                     <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number *</label>
                     <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div className="relative">
                     <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Product *</label>
                     <input 
                        type="text" 
                        value={productSearch}
                        onChange={(e) => {
                           setProductSearch(e.target.value);
                           setShowDropdown(true);
                           if (!e.target.value) setFormData(prev => ({ ...prev, productId: "" }));
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        placeholder="Search by Product Code or Name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        required={!formData.productId}
                     />
                     {showDropdown && (
                        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                           {filteredProducts.map(p => (
                              <li 
                                 key={p._id} 
                                 onClick={() => handleProductSelect(p)}
                                 className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
                              >
                                 <span className="font-semibold">{p.productCode || p._id}</span> - {p.name} (₹{p.price})
                              </li>
                           ))}
                           {filteredProducts.length === 0 && (
                              <li className="px-4 py-2 text-gray-500 dark:text-gray-400">No products found</li>
                           )}
                        </ul>
                     )}
                  </div>

                  {showSizes && (
                     <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Size</label>
                        <select name="size" value={formData.size} onChange={handleInputChange} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                           <option value="">Select a size</option>
                           {Object.keys(selectedProduct.sizes || {}).filter(s => selectedProduct.sizes[s] > 0).map(size => (
                              <option key={size} value={size}>{size}</option>
                           ))}
                        </select>
                     </div>
                  )}

                  <div>
                     <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address</label>
                     <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                     <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pincode</label>
                     <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
               </div>

               <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Additional Details</label>
                  <textarea name="additionalDetails" value={formData.additionalDetails} onChange={handleInputChange} rows="2" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
               </div>

               {selectedProduct?.category === 'Ready-to-stitch Churidar' && (
                  <div className="mb-4">
                     <label className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        <input type="checkbox" name="wantStitched" checked={formData.wantStitched} onChange={handleInputChange} className="rounded border-gray-300 text-fuchsia-800" />
                        <span>Want Stitched?</span>
                     </label>
                  </div>
               )}

               {formData.wantStitched && (
                  <div className="grid gap-4 mb-4 sm:grid-cols-4">
                     {["length", "chest", "waist", "hip", "armFit", "sleeveLength", "sleeveWidth", "backNeck", "frontNeck"].map(m => (
                        <div key={m}>
                           <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white capitalize">{m.replace(/([A-Z])/g, ' $1')}</label>
                           <input type="number" name={m} value={formData[m]} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                     ))}
                  </div>
               )}

               <div className="flex justify-end space-x-4">
                  <button type="button" onClick={closeModal} className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5">
                     Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50">
                     {isSubmitting ? "Creating..." : "Create Order"}
                  </button>
               </div>
            </form>

            {toast.show && (
               <div className="absolute top-4 right-4 z-50">
                  <Toast message={toast.message} type={toast.type} />
               </div>
            )}
         </div>
      </div>
   );
};

export default CreateOrderModal;
