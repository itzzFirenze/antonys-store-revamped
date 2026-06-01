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

   const initialCustomerState = {
      customerName: "",
      customerEmail: "",
      phoneNumber: "",
      address: "",
      pincode: "",
      additionalDetails: "",
   };
   const [customerInfo, setCustomerInfo] = useState(initialCustomerState);

   const initialItemState = {
      productId: "",
      size: "",
      wantStitched: false,
      length: "", chest: "", waist: "", hip: "", armFit: "", sleeveLength: "", sleeveWidth: "", backNeck: "", frontNeck: ""
   };
   const [currentItem, setCurrentItem] = useState(initialItemState);
   const [selectedItems, setSelectedItems] = useState([]);

   useEffect(() => {
      if (isOpen) {
         fetchProducts();
         setCustomerInfo(initialCustomerState);
         setCurrentItem(initialItemState);
         setSelectedItems([]);
         setProductSearch("");
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

   const handleCustomerChange = (e) => {
      const { name, value } = e.target;
      setCustomerInfo(prev => ({ ...prev, [name]: value }));
   };

   const handleItemChange = (e) => {
      const { name, value, type, checked } = e.target;
      setCurrentItem(prev => ({
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
      setCurrentItem(prev => ({ ...prev, productId: product._id, size: "" }));
      setProductSearch(product.productCode ? `${product.productCode} - ${product.name}` : product.name);
      setShowDropdown(false);
   };

   const handleAddItem = () => {
      if (!currentItem.productId) {
         showToast("Please select a product first", "error");
         return;
      }
      
      const productDetails = products.find(p => p._id === currentItem.productId);
      
      if (productDetails && (productDetails.category === "Ready-made churidar" || productDetails.category === "Leggings/Pants") && !currentItem.size) {
          showToast("Please select a size", "error");
          return;
      }

      setSelectedItems(prev => [...prev, currentItem]);
      setCurrentItem(initialItemState);
      setProductSearch("");
   };

   const handleRemoveItem = (index) => {
      setSelectedItems(prev => prev.filter((_, i) => i !== index));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (selectedItems.length === 0) {
         showToast("Please add at least one product to the order", "error");
         return;
      }
      
      setIsSubmitting(true);

      try {
         const payload = {
             ...customerInfo,
             orderItems: selectedItems
         };
         await axios.post(`${BASE_URL}/api/orders/admin-create`, payload);

         showToast("Orders created successfully", "success");
         setTimeout(() => {
            onOrderCreated();
            closeModal();
         }, 1000);
      } catch (error) {
         showToast(error.response?.data?.message || "Error creating orders", "error");
      } finally {
         setIsSubmitting(false);
      }
   };

   if (!isOpen) return null;

   const selectedProduct = products.find(p => p._id === currentItem.productId);
   const showSizes = selectedProduct && (selectedProduct.category === "Ready-made churidar" || selectedProduct.category === "Leggings/Pants");

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
         <div className="relative w-full max-w-5xl bg-white rounded-lg shadow dark:bg-gray-800 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600 shrink-0">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create Manual Order
               </h3>
               <button onClick={closeModal} className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 dark:hover:bg-gray-600 dark:hover:text-white">
                  <span className="sr-only">Close modal</span>
                  &times;
               </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
               <form id="create-order-form" onSubmit={handleSubmit}>
                  <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Customer Details</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                         <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Customer Name *</label>
                            <input type="text" name="customerName" value={customerInfo.customerName} onChange={handleCustomerChange} required className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                         </div>
                         <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Customer Email</label>
                            <input type="email" name="customerEmail" value={customerInfo.customerEmail} onChange={handleCustomerChange} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                         </div>
                         <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number *</label>
                            <input type="tel" name="phoneNumber" value={customerInfo.phoneNumber} onChange={handleCustomerChange} required className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                         </div>
                         <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address</label>
                            <input type="text" name="address" value={customerInfo.address} onChange={handleCustomerChange} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                         </div>
                         <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pincode</label>
                            <input type="text" name="pincode" value={customerInfo.pincode} onChange={handleCustomerChange} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                         </div>
                         <div className="sm:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Additional Details</label>
                            <textarea name="additionalDetails" value={customerInfo.additionalDetails} onChange={handleCustomerChange} rows="2" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                         </div>
                      </div>
                  </div>

                  <div className="mb-6 p-4 border border-blue-100 dark:border-blue-900/50 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Add Products</h4>
                      
                      <div className="grid gap-4 sm:grid-cols-2 mb-4">
                          <div className="relative">
                             <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Search Product *</label>
                             <input 
                                type="text" 
                                value={productSearch}
                                onChange={(e) => {
                                   setProductSearch(e.target.value);
                                   setShowDropdown(true);
                                   if (!e.target.value) setCurrentItem(prev => ({ ...prev, productId: "" }));
                                }}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                placeholder="Search by Product Code or Name"
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
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
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Size *</label>
                                <select name="size" value={currentItem.size} onChange={handleItemChange} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                   <option value="">Select a size</option>
                                   {Object.keys(selectedProduct.sizes || {}).filter(s => selectedProduct.sizes[s] > 0).map(size => (
                                      <option key={size} value={size}>{size}</option>
                                   ))}
                                </select>
                             </div>
                          )}
                      </div>

                      {selectedProduct?.category === 'Ready-to-stitch Churidar' && (
                         <div className="mb-4">
                            <label className="flex items-center space-x-2 text-gray-900 dark:text-white">
                               <input type="checkbox" name="wantStitched" checked={currentItem.wantStitched} onChange={handleItemChange} className="rounded border-gray-300 text-fuchsia-800" />
                               <span>Want Stitched?</span>
                            </label>
                         </div>
                      )}

                      {currentItem.wantStitched && (
                         <div className="grid gap-4 mb-4 sm:grid-cols-4 bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
                            {["length", "chest", "waist", "hip", "armFit", "sleeveLength", "sleeveWidth", "backNeck", "frontNeck"].map(m => (
                               <div key={m}>
                                  <label className="block mb-1 text-xs font-medium text-gray-900 dark:text-white capitalize">{m.replace(/([A-Z])/g, ' $1')}</label>
                                  <input type="number" name={m} value={currentItem[m]} onChange={handleItemChange} className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                               </div>
                            ))}
                         </div>
                      )}

                      <div className="flex justify-end mt-4">
                         <button type="button" onClick={handleAddItem} className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2">
                             Add Product to Order
                         </button>
                      </div>
                  </div>

                  {selectedItems.length > 0 && (
                      <div className="mb-6">
                         <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                            Order Summary
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                               {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'}
                            </span>
                         </h4>
                         <div className="space-y-3">
                            {selectedItems.map((item, index) => {
                               const pDetails = products.find(p => p._id === item.productId);
                               return (
                                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                      <div className="flex flex-col">
                                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                                              {pDetails ? (pDetails.productCode ? `${pDetails.productCode} - ${pDetails.name}` : pDetails.name) : item.productId}
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {item.size ? `Size: ${item.size}` : ''}
                                              {item.size && item.wantStitched ? ' | ' : ''}
                                              {item.wantStitched ? 'Stitched' : ''}
                                          </span>
                                      </div>
                                      <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors dark:text-red-500 dark:hover:bg-gray-700">
                                          Remove
                                      </button>
                                  </div>
                               );
                            })}
                         </div>
                      </div>
                  )}

               </form>
            </div>

            <div className="flex justify-end space-x-4 p-4 border-t dark:border-gray-600 shrink-0">
               <button type="button" onClick={closeModal} className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5">
                  Cancel
               </button>
               <button type="submit" form="create-order-form" disabled={isSubmitting || selectedItems.length === 0} className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50">
                  {isSubmitting ? "Submitting..." : `Create Order (${selectedItems.length})`}
               </button>
            </div>

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
