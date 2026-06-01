import React, { useState } from "react";

const FilterDropdown = ({ filterStatus, setFilterStatus }) => {
   const [isOpen, setIsOpen] = useState(false);

   const options = [
      { value: "all", label: "All Users" },
      { value: "admin", label: "Admins Only" },
      { value: "user", label: "Users Only" },
   ];

   const handleOptionClick = (value) => {
      setFilterStatus(value);
      setIsOpen(false);
   };

   return (
      <div className="relative w-48">
         {/* Button with arrow */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-gray-50 border text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white flex items-center justify-between"
         >
            <span>{options.find((option) => option.value === filterStatus)?.label}</span>
            <svg
               className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
               ></path>
            </svg>
         </button>

         {/* Dropdown menu */}
         {isOpen && (
            <ul className="absolute mt-2 w-full bg-gray-50 dark:bg-gray-700 border rounded-xl shadow-lg z-10">
               {options.map((option) => (
                  <li
                     key={option.value}
                     className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer rounded-xl"
                     onClick={() => handleOptionClick(option.value)}
                  >
                     {option.label}
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
};

export default FilterDropdown;