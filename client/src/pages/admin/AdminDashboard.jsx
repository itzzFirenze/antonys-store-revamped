import React, { useState, useEffect } from "react";
import { ShoppingBag, Users, Package, Clock } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../../Redux/Constants/BASE_URL";

// ─── Circular Progress ────────────────────────────────────────────────────
const CircularProgress = ({ value = 0, max = 100, color, trackColor = "#f3f4f6", size = 72, stroke = 7 }) => {
   const r = (size - stroke) / 2;
   const circ = 2 * Math.PI * r;
   const pct = max > 0 ? Math.min(value / max, 1) : 0;
   const offset = circ * (1 - pct);

   return (
      <svg
         width={size}
         height={size}
         style={{ transform: "rotate(-90deg)" }}
      >
         <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
         <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
         />
      </svg>
   );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, ringColor, trackColor, max }) => (
   <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
      <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 72, height: 72 }}>
         <CircularProgress value={value} max={max} color={ringColor} trackColor={trackColor} />
         <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-5 h-5" style={{ color }} />
         </div>
      </div>
      <div className="min-w-0">
         <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-0.5">{label}</p>
         <p className="text-3xl font-bold text-gray-900 leading-none">{value ?? 0}</p>
      </div>
   </div>
);

// ─── Skeleton ──────────────────────────────────────────────────────────────
const Skeleton = () => (
   <div className="space-y-6">
      <div className="h-7 w-48 bg-gray-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 animate-pulse">
               <div className="w-[72px] h-[72px] rounded-full bg-gray-100 flex-shrink-0" />
               <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-7 w-12 bg-gray-100 rounded" />
               </div>
            </div>
         ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse h-40" />
         ))}
      </div>
   </div>
);

// ─── Quick Info Row ────────────────────────────────────────────────────────
const InfoRow = ({ label, value, accent }) => (
   <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${accent ?? "text-gray-800"}`}>{value}</span>
   </div>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────
const AdminDashboard = () => {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      axios
         .get(`${BASE_URL}/api/admin/dashboard-stats`)
         .then((res) => { if (res.data) setData(res.data); })
         .catch((err) => setError(err.message || "Failed to fetch dashboard data"))
         .finally(() => setLoading(false));
   }, []);

   const today = new Date().toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
   });

   if (loading) return <Skeleton />;

   if (error)
      return (
         <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <strong>Error:</strong> {error}
         </div>
      );

   const totalOrders = (data?.activeOrders ?? 0) + (data?.ordersToApprove ?? 0);
   const approvalRate = totalOrders > 0
      ? Math.round(((data?.ordersToApprove ?? 0) / totalOrders) * 100)
      : 0;

   const stats = [
      {
         label: "Total Users",
         value: data?.totalUsers ?? 0,
         max: Math.max(data?.totalUsers ?? 0, 100),
         icon: Users,
         color: "#4338ca",
         ringColor: "#6366f1",
         trackColor: "#e0e7ff",
      },
      {
         label: "Incomplete Orders",
         value: data?.activeOrders ?? 0,
         max: Math.max(totalOrders, 1),
         icon: Clock,
         color: "#b91c1c",
         ringColor: "#ef4444",
         trackColor: "#fee2e2",
      },
      {
         label: "Awaiting Approval",
         value: data?.ordersToApprove ?? 0,
         max: Math.max(totalOrders, 1),
         icon: ShoppingBag,
         color: "#b45309",
         ringColor: "#f59e0b",
         trackColor: "#fef3c7",
      },
      {
         label: "Products in Stock",
         value: data?.productsInStock ?? 0,
         max: Math.max(data?.productsInStock ?? 0, 200),
         icon: Package,
         color: "#7c3aed",
         ringColor: "#a855f7",
         trackColor: "#f3e8ff",
      },
   ];

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-start justify-between">
            <div>
               <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
               <p className="text-sm text-gray-400 mt-0.5">{today}</p>
            </div>
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold bg-gray-100 px-3 py-1.5 rounded-full">
               Admin
            </span>
         </div>

         {/* Stat cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
               <StatCard key={s.label} {...s} />
            ))}
         </div>

         {/* Secondary row */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Orders summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
               <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-4">
                  Orders Overview
               </p>
               <InfoRow label="Total orders" value={totalOrders} />
               <InfoRow label="Incomplete" value={data?.activeOrders ?? 0} accent="text-red-500" />
               <InfoRow label="Awaiting approval" value={data?.ordersToApprove ?? 0} accent="text-amber-600" />
               <InfoRow
                  label="Approval pending rate"
                  value={`${approvalRate}%`}
                  accent={approvalRate > 50 ? "text-red-500" : "text-emerald-600"}
               />
            </div>

            {/* Inventory summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
               <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-4">
                  Inventory
               </p>
               <InfoRow label="Products in stock" value={data?.productsInStock ?? 0} />
               <InfoRow label="Registered users" value={data?.totalUsers ?? 0} />
               <InfoRow
                  label="Stock status"
                  value={(data?.productsInStock ?? 0) > 0 ? "Available" : "Out of stock"}
                  accent={(data?.productsInStock ?? 0) > 0 ? "text-emerald-600" : "text-red-500"}
               />
               <InfoRow
                  label="User base"
                  value={(data?.totalUsers ?? 0) > 50 ? "Growing" : "Early stage"}
                  accent="text-indigo-600"
               />
            </div>

         </div>
      </div>
   );
};

export default AdminDashboard;