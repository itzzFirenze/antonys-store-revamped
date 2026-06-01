import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from "../layouts/Layouts";
import { useSelector } from 'react-redux';
import { Spinner } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import OrderDetail from './OrderDetail';
import { BASE_URL } from '../Redux/Constants/BASE_URL';

const Orders = () => {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const { userInfo } = useSelector(state => state.userLoginReducer);

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedOrderId, setSelectedOrderId] = useState(null);

   useEffect(() => {
      const fetchOrders = async () => {
         setLoading(true);
         if (!userInfo) {
            setError("Please log in to view your orders.");
            setLoading(false);
            return;
         }

         try {
            const userId = userInfo._id;
            const response = await axios.get(`${BASE_URL}/api/orders?userId=${userId}`);
            const ordersData = response.data.orders || [];
            const filteredOrders = ordersData.filter(order => !order.isPending);
            const updatedOrders = await Promise.all(filteredOrders.map(async (order) => {
               try {
                  const orderPriceResponse = await axios.get(`${BASE_URL}/api/products/${order.productId}`);
                  const orderPrice = orderPriceResponse.data.price || 0;

                  const orderStatus = getOrderStatus(order);

                  return {
                     ...order,
                     status: orderStatus,
                     price: orderPrice,
                  };
               } catch (error) {
                  console.error("Error fetching order details", error);
                  return order;
               }
            }));

            updatedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setOrders(updatedOrders);
         } catch (error) {
            setError("Error fetching orders.");
            console.error("Error fetching orders", error);
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();
   }, [userInfo]);


   const getOrderStatus = (order) => {
      if (order.isPending && !order.isCompleted) {
         return "Pending";
      } else if (!order.isPending && order.isCompleted) {
         return "Completed";
      } else {
         return "In Progress";
      }
   };

   const navigate = useNavigate();

   const handleShopNow = () => {
      navigate('/shop');
   };

   const openModal = (orderId) => {
      setSelectedOrderId(orderId);
      setIsModalOpen(true);
   };

   const closeModal = () => {
      setIsModalOpen(false);
      setSelectedOrderId(null);
   };

   if (loading) {
      return (
         <Layout>
            <div className="fixed inset-0 flex items-center justify-center bg-white">
               <Spinner />
            </div>
         </Layout>
      );
   }

   if (error) {
      return (
         <Layout>
            <div className="fixed inset-0 flex items-center justify-center">
               <div className="text-red-500 text-lg">{error}</div>
            </div>
         </Layout>
      );
   }

   return (
      <Layout>
         <section className="mb-8 py-16 bg-gradient-to-r from-green-500 via-teal-500 to-green-500">
            <div className="text-center text-gray-100 px-6 py-10">
               <h2 className="text-4xl font-extrabold mt-8">Your Orders</h2>
               <p className="text-lg">Track your previous purchases and their status!</p>
            </div>
         </section>

         <section className="container mx-auto px-4 md:px-12 max-w-7xl">
            <div className="mb-16">
               <h3 className="text-3xl font-semibold text-fuchsia-800 mb-6">Your Order History</h3>

               {orders.length === 0 ? (
                  <div className="text-center text-neutral-500">
                     <img src="/icons/cart.png" alt="No Orders" className="mx-auto mb-6 w-20 h-20" />
                     <p className="text-lg">You have no orders yet. Start shopping now!</p>
                     <div className="mt-8 text-center">
                        <button
                           onClick={handleShopNow}
                           className="bg-fuchsia-800 text-white py-3 px-8 rounded-full text-xl hover:bg-fuchsia-800 transition duration-300"
                        >
                           Shop Now
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-8">
                     {orders.map((order) => (
                        <div
                           key={order._id}
                           className="bg-white p-6 md:p-8 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center"
                        >
                           <div className="flex-1 mb-4 md:mb-0">
                              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                 Order #{order.orderId}
                              </h4>
                              <p className="text-gray-600 text-sm md:text-base">
                                 <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-gray-600 text-sm md:text-base">
                                 <strong>Status:</strong> {order.status}
                              </p>
                              <p className="text-gray-600 text-sm md:text-base">
                                 <strong className="font-semibold">Price:</strong>
                                 <span className="font-[inter]"> ₹</span>
                                 {order.price ? (order.price + 50).toFixed(2) : 'N/A'}
                              </p>

                           </div>
                           <button
                              onClick={() => openModal(order._id)} // Open the modal with the clicked order's id
                              className="bg-fuchsia-800 text-gray-100 py-2 px-4 rounded-lg hover:bg-fuchsia-900 transition duration-300 text-sm md:text-base"
                           >
                              View Details
                           </button>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </section>

         {/* Modal to show order details */}
         <OrderDetail
            isOpen={isModalOpen}
            closeModal={closeModal}
            orderId={selectedOrderId}
         />
      </Layout>
   );
};

export default Orders;