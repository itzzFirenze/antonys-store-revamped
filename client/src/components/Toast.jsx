import React from 'react';

const Toast = ({ message, type, onClose }) => (
   <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center w-full z-50">
      <div
         className={`relative w-auto max-w-sm px-6 py-3 rounded-md shadow-lg flex items-center justify-between ${type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white text-sm font-medium`}
      >
         <span>{message}</span>
         <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-300 focus:outline-none"
            style={{ lineHeight: "1" }}
         >
            ✕
         </button>
      </div>
   </div>
);

export default Toast;