import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Layout from "../../layouts/Layouts";
import { useDispatch } from "react-redux";
import { userLogoutAction } from "../../Redux/Actions/User";
import AdminDashboard from "./AdminDashboard";
import {
   Package,
   Users,
   ShoppingBag,
   ChevronDown,
   LayoutDashboard,
   Home,
   LogOut,
} from "lucide-react";

// ─── Nav Item Types ────────────────────────────────────────────────────────

const NavLink = ({ to, label, onClick }) => {
   const location = useLocation();
   const isActive = location.pathname === to;
   return (
      <Link
         to={to}
         onClick={onClick}
         className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${isActive
            ? "bg-fuchsia-50 text-fuchsia-900 font-semibold"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
      >
         <span className={`w-1 h-1 rounded-full flex-shrink-0 ${isActive ? "bg-fuchsia-600" : "bg-gray-300"}`} />
         {label}
      </Link>
   );
};

const NavGroup = ({ icon: Icon, label, basePath, children }) => {
   const location = useLocation();
   const isGroupActive = location.pathname.startsWith(basePath);
   const [isOpen, setIsOpen] = useState(isGroupActive);

   return (
      <div>
         <button
            onClick={() => setIsOpen((v) => !v)}
            className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${isGroupActive
               ? "text-fuchsia-900 bg-fuchsia-50"
               : "text-gray-700 hover:bg-gray-100"
               }`}
         >
            <Icon className={`w-4 h-4 flex-shrink-0 ${isGroupActive ? "text-fuchsia-700" : "text-gray-500"}`} />
            <span className="flex-1 text-left">{label}</span>
            <ChevronDown
               className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
         </button>

         {/* Animated dropdown */}
         <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
               }`}
         >
            <div className="ml-7 mt-1 flex flex-col gap-0.5 border-l border-gray-100 pl-3">
               {children}
            </div>
         </div>
      </div>
   );
};

const BottomNavItem = ({ to, icon: Icon, label, onClick, isButton }) => {
   const location = useLocation();
   const isActive = to && location.pathname === to;

   const classes = `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive
      ? "bg-fuchsia-50 text-fuchsia-900"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
      }`;

   if (isButton) {
      return (
         <button onClick={onClick} className={classes}>
            <Icon className="w-4 h-4 flex-shrink-0 text-gray-500" />
            {label}
         </button>
      );
   }
   return (
      <Link to={to} className={classes}>
         <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-fuchsia-600" : "text-gray-500"}`} />
         {label}
      </Link>
   );
};

// ─── Sidebar ───────────────────────────────────────────────────────────────

const Sidebar = () => {
   const dispatch = useDispatch();

   return (
      <aside className="w-60 h-screen bg-white border-r border-gray-100 fixed top-0 left-0 z-30 flex flex-col">
         {/* Brand */}
         <div className="flex items-center gap-2.5 px-4 pt-4 pb-1 border-b border-gray-200">
            <img src="/antonys_logo.png" alt="Antony's Boutique" className="w-12 h-12 object-contain flex-shrink-0" />
            <div>
               <p className="text-sm font-semibold text-gray-900 leading-none">Antony's Boutique</p>
               <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest">Admin</p>
            </div>
         </div>

         {/* Nav */}
         <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold px-3 mb-2">
               Manage
            </p>

            <NavGroup icon={Package} label="Products" basePath="/admin/view-products">
               <NavLink to="/admin/view-products" label="View Products" />
            </NavGroup>

            <NavGroup icon={Users} label="Users" basePath="/admin/view-users">
               <NavLink to="/admin/view-users" label="View Users" />
               <NavLink to="/admin/view-users-wishlist" label="Wishlists" />
            </NavGroup>

            <NavGroup icon={ShoppingBag} label="Orders" basePath="/admin/view-orders">
               <NavLink to="/admin/view-orders" label="View Orders" />
               <NavLink to="/admin/view-approved-orders" label="Approved Orders" />
            </NavGroup>
         </nav>

         {/* Bottom actions */}
         <div className="px-3 pb-4 border-t border-gray-200 pt-3 space-y-0.5">
            <BottomNavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
            <BottomNavItem to="/" icon={Home} label="Go to Store" />
            <BottomNavItem
               isButton
               icon={LogOut}
               label="Logout"
               onClick={() => dispatch(userLogoutAction())}
            />
         </div>
      </aside>
   );
};

// ─── Main Admin Layout ─────────────────────────────────────────────────────

const Admin = () => {
   const [refreshFlag, setRefreshFlag] = useState(false);
   const location = useLocation();
   const isMainDashboard = location.pathname === "/admin";

   const refreshProducts = () => setRefreshFlag((prev) => !prev);

   return (
      <Layout showNavbarAndFooter={false}>
         <div className="flex h-screen bg-gray-50">
            <Sidebar />

            {/* Main content */}
            <main className="flex-1 ml-60 h-screen overflow-y-auto">
               {isMainDashboard ? (
                  <div className="p-6">
                     <AdminDashboard />
                  </div>
               ) : (
                  <Outlet context={{ refreshProducts, refreshFlag }} />
               )}
            </main>
         </div>
      </Layout>
   );
};

export default Admin;