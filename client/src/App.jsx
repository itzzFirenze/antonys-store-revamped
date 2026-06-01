import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from "react";
import { useSelector } from 'react-redux';
import ProductDetail from './pages/ProductDetail';
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserProfile from './pages/UserProfile';
import Wishlist from './pages/Wishlist';
import Admin from './pages/admin/Admin';
import ViewProducts from './pages/admin/ViewProducts';
import ViewUsers from './pages/admin/ViewUsers';
import ViewUsersWishlist from './pages/admin/ViewUsersWishlist';
import ViewOrders from './pages/admin/ViewOrders';
import ViewApprovedOrders from './pages/admin/ViewApprovedOrders';
import { ResetPassword } from './pages/auth/ResetPassword';

function App() {
   const userLoginReducer = useSelector((state) => state.userLoginReducer);
   const { userInfo } = userLoginReducer;

   return (
      <Router>
         <ResetFiltersOnNavigation />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/about" element={<About />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={userInfo ? <Navigate to="/" /> : <Login />} />
            <Route path="/reset-password" element={userInfo ? <Navigate to="/" /> : <ResetPassword />} />
            <Route path="/register" element={userInfo ? <Navigate to="/" /> : <Register />} />

            <Route path="/admin" element={userInfo ? <Admin /> : <Navigate to="/login" />}>
               <Route path="view-products" element={<ViewProducts />} />
               <Route path="view-users" element={<ViewUsers />} />
               <Route path="view-users-wishlist" element={<ViewUsersWishlist />} />
               <Route path="view-orders" element={<ViewOrders />} />
               <Route path="view-approved-orders" element={<ViewApprovedOrders />} />
            </Route>
         </Routes>
      </Router>
   );
}

function ResetFiltersOnNavigation() {
   const location = useLocation();

   useEffect(() => {
      const resetFilterPages = ["/", "/home", "/about", "/contactus"];
      if (resetFilterPages.includes(location.pathname)) {
         sessionStorage.removeItem("sortOption");
         sessionStorage.removeItem("selectedCategory");
         sessionStorage.removeItem("selectedColors");
      }
   }, [location.pathname]);

   return null;
}

export default App;
