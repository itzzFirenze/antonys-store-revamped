import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../../Redux/Constants/BASE_URL';

const CircularProgress = ({ value, maxValue, color, label, icon: Icon }) => {
   const radius = 40;
   const stroke = 8;
   const normalizedRadius = radius - stroke * 0.5;
   const circumference = normalizedRadius * 2 * Math.PI;

   const percentage = maxValue ? (value / maxValue) * 100 : 100;
   const strokeDashoffset = circumference - (percentage / 100) * circumference;

   return (
      <div className="bg-white rounded-lg shadow-md p-4">
         <div className="flex items-center space-x-4">
            <div className="relative">
               <svg height={radius * 2} width={radius * 2}>
                  <circle
                     stroke="#e5e7eb"
                     fill="transparent"
                     strokeWidth={stroke}
                     r={normalizedRadius}
                     cx={radius}
                     cy={radius}
                  />
                  <circle
                     stroke={color}
                     fill="transparent"
                     strokeWidth={stroke}
                     strokeLinecap="round"
                     strokeDasharray={`${circumference} ${circumference}`}
                     style={{ strokeDashoffset }}
                     r={normalizedRadius}
                     cx={radius}
                     cy={radius}
                  />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                  <Icon size={24} className="text-gray-600" />
               </div>
            </div>
            <div>
               <div className="text-sm font-medium text-gray-500">{label}</div>
               <div className="text-2xl font-bold">{value || 0}</div>
            </div>
         </div>
      </div>
   );
};

const AdminDashboard = () => {
   const [dashboardData, setDashboardData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [incompleteOrdersCount, setIncompleteOrdersCount] = useState(0);

   useEffect(() => {
      const fetchDashboardData = async () => {
         try {
            const response = await axios.get(`${BASE_URL}/api/admin/dashboard-stats`);

            if (response.data) {
               setDashboardData(response.data);
               setIncompleteOrdersCount(response.data.activeOrders);
            }
         } catch (err) {
            setError(err.message || 'Failed to fetch dashboard data');
         } finally {
            setLoading(false);
         }
      };

      fetchDashboardData();
   }, []);

   if (loading) {
      return (
         <div className="p-6">
            <div className="animate-pulse">Loading dashboard data...</div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
               <strong className="font-bold">Error!</strong>
               <span className="block sm:inline"> {error}</span>
            </div>
         </div>
      );
   }

   return (
      <div className="p-6 space-y-6">
         <h1 className="text-2xl font-bold">Antony's Boutique Dashboard</h1>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CircularProgress
               value={dashboardData?.totalUsers || 0}
               color="#4f46e5"
               label="Total Users"
               icon={Users}
            />
            <CircularProgress
               value={incompleteOrdersCount}
               color="#ef4444"
               label="Incomplete Orders"
               icon={ShoppingBag}
            />
            <CircularProgress
               value={dashboardData?.ordersToApprove || 0}
               color="#eab308"
               label="Orders to approve"
               icon={TrendingUp}
            />
            <CircularProgress
               value={dashboardData?.productsInStock || 0}
               color="#8b5cf6"
               label="Products in Stock"
               icon={Package}
            />
         </div>
      </div>
   );
};

export default AdminDashboard;