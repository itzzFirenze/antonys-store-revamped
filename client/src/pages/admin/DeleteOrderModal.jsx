import React from "react";
import { useDispatch } from "react-redux";
import { deleteOrderAction } from "../../Redux/Actions/Order";

const DeleteOrderModal = ({ isOpen, closeModal, order, onDeleteSuccess }) => {
   const dispatch = useDispatch();
   
   const handleDelete = async () => {
      if (order) {
         try {
            await dispatch(deleteOrderAction(order._id));
            onDeleteSuccess?.();
         } catch (error) {
            console.error('Error deleting order:', error);
         } finally {
            closeModal();
         }
      }
   };

   if (!isOpen) return null;

   return (
      <div
         id="delete-order-modal"
         className="fixed inset-0 z-[60] flex justify-center items-center w-full h-full bg-black bg-opacity-50"
      >
         <div
            className="relative bg-white rounded-lg shadow dark:bg-gray-700 p-6"
            style={{ width: "430px" }}
         >
            <button
               type="button"
               onClick={closeModal}
               className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm"
            >
               <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
               >
                  <path
                     stroke="currentColor"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
               </svg>
            </button>
            
            <svg
               className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
               aria-hidden="true"
               xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 20 20"
            >
               <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
               />
            </svg>
            
            <h3 className="text-center text-lg font-normal text-gray-500 dark:text-gray-400 mb-5">
               Are you sure you want to delete this order?
            </h3>
            
            <div className="flex justify-center">
               <button
                  onClick={handleDelete}
                  className="text-gray-100 bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5"
               >
                  Yes, I'm sure
               </button>
               <button
                  onClick={closeModal}
                  className="ml-3 py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-600"
               >
                  No, cancel
               </button>
            </div>
         </div>
      </div>
   );
};

export default DeleteOrderModal;