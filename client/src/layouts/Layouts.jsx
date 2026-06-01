import React from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer";

const Layout = ({ children, showNavbarAndFooter = true }) => {
   return (
      <>
         <div className="min-h-screen flex flex-col">
            {showNavbarAndFooter && <Navbar />}
            <main className="flex-grow">{children}</main>
            {showNavbarAndFooter && <Footer />}
         </div>
      </>

   );
};

export default Layout;