import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

const Footer = () => {
   const [showModal, setShowModal] = useState(false);
   const [isMobileView, setIsMobileView] = useState(false);
   const location = useLocation();

   useEffect(() => {
      if (location.pathname === "/shop") {
         const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 768);
         };

         checkMobileView();
         window.addEventListener("resize", checkMobileView);

         return () => window.removeEventListener("resize", checkMobileView);
      }
   }, [location.pathname]);

   useEffect(() => {
      if (showModal) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [showModal]);

   return (
      <>
         <footer className={`bg-white rounded-lg shadow m-4 dark:bg-gray-800 ${isMobileView ? 'mb-20' : ''}`}>
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
               <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <Link to="/" className="hover:underline">Antony's™</Link>. All Rights Reserved.</span>
               <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
                  <li><Link to="/about" className="hover:underline me-4 md:me-6">About</Link></li>
                  <li><Link to="/contactus" className="hover:underline me-4 md:me-6">Contact</Link></li>
                  <li><button onClick={() => setShowModal(true)} className="hover:underline">Policies</button></li>
               </ul>
            </div>
         </footer>

         {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
               <div className="relative p-4 w-full max-w-2xl">
                  <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                     <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Policies</h3>
                        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                           <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                           </svg>
                        </button>
                     </div>
                     <div className="p-4 md:p-5 space-y-4">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                           Ordered products cannot be cancelled or returned. All products are carefully inspected before shipping to ensure quality. In case of receiving a damaged or defective product, please contact us within 24 hours of delivery.
                        </p>
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                           Antony's Boutique is not responsible for any delays caused by courier services. Custom-stitched products cannot be exchanged or returned under any circumstances.
                        </p>
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                           By placing an order, you agree to abide by all the above policies.
                        </p>
                     </div>
                     <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button onClick={() => setShowModal(false)} className="text-gray-100 bg-fuchsia-800 hover:bg-fuchsia-900 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Close</button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

export default Footer;