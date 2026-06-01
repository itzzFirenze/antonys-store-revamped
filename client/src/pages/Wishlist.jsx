import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from "../layouts/Layouts";
import { useSelector } from 'react-redux';
import { Spinner } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../Redux/Constants/BASE_URL';

const Wishlist = () => {
   const [wishlist, setWishlist] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [productDetails, setProductDetails] = useState([]);
   const { userInfo } = useSelector(state => state.userLoginReducer);

   const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
   };

   const navigate = useNavigate();

   useEffect(() => {
      const fetchWishlist = async () => {
         setLoading(true);
         if (!userInfo) {
            setError("Please log in to view your wishlist.");
            setLoading(false);
            return;
         }

         try {
            const userId = userInfo._id;
            const response = await axios.get(`${BASE_URL}/api/wishlist?userId=${userId}`);
            const wishlistData = response.data.wishlist || [];

            // Validate each product and remove non-existent ones
            const validProductPromises = wishlistData.map(async (productId) => {
               try {
                  await axios.get(`${BASE_URL}/api/products/${productId}`);
                  return productId; // Product exists
               } catch (error) {
                  // Product doesn't exist, remove it from wishlist
                  await axios.delete(`${BASE_URL}/api/wishlist/${productId}`, {
                     data: { userId: userInfo._id },
                  });
                  return null;
               }
            });

            const validProductIds = (await Promise.all(validProductPromises)).filter(id => id !== null);
            setWishlist(validProductIds);

            if (validProductIds.length === 0) {
               setProductDetails([]);
               return;
            }

            const productPromises = validProductIds.map(productId =>
               axios.get(`${BASE_URL}/api/products/${productId}`)
            );

            const productResponses = await Promise.all(productPromises);
            const fetchedProductDetails = productResponses.map(res => res.data).reverse();
            setProductDetails(fetchedProductDetails);
         } catch (error) {
            setError("Error fetching wishlist");
            console.error("Error fetching wishlist", error);
         } finally {
            setLoading(false);
         }
      };

      fetchWishlist();
   }, [userInfo]);

   // Rest of the component remains the same...
   const handleRemove = async (productId) => {
      try {
         await axios.delete(`${BASE_URL}/api/wishlist/${productId}`, {
            data: { userId: userInfo._id },
         });

         setWishlist(wishlist.filter((id) => id !== productId));
         setProductDetails(productDetails.filter((product) => product._id !== productId));
      } catch (error) {
         console.error("Error removing product from wishlist:", error);
      }
   };

   const handleShopNow = () => {
      navigate('/shop');
   };

   const getImageSrc = (image) => {
      if (!image) return '/placeholder-image.jpg';
      return image.startsWith('data:') || image.startsWith('http')
         ? image
         : `data:image/jpeg;base64,${image}`;
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
         <section className="mb-8 py-16 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600">
            <div className="text-center text-gray-100 px-6 py-10">
               <h2 className="text-4xl font-extrabold mt-8">Your Wishlist</h2>
               <p className="text-lg">Your favorite products are waiting for you!</p>
            </div>
         </section>

         <section className="container mx-auto px-4 md:px-12 max-w-7xl">
            <div className="mb-16">
               <h3 className="text-3xl font-semibold text-fuchsia-800 mb-6">Your Saved Products</h3>

               {wishlist.length === 0 ? (
                  <div className="text-center text-neutral-500">
                     <img src="/icons/empty-wishlist.png" alt="Empty Wishlist" className="mx-auto mb-6 w-20 h-20" />
                     <p className="text-lg">Your wishlist is currently empty. Start adding products you love!</p>
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
                  <div>
                     <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-12">
                        {productDetails.map((product) => {
                           const isOutOfStock = product.countInStock === 0;

                           return (
                              <div
                                 key={product._id}
                                 className="bg-white p-4 md:p-6 rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 flex flex-col h-full"
                              >
                                 <Link
                                    to={`/products/${product._id}`}
                                    className="mb-4 relative"
                                 >
                                    <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 relative">
                                       <img
                                          alt={product.name}
                                          className={`h-full w-full object-cover ${isOutOfStock ? 'opacity-50' : ''}`}
                                          src={getImageSrc(product.image)}
                                          onError={(e) => {
                                             e.target.onerror = null;
                                             e.target.src = '/placeholder-image.jpg';
                                          }}
                                       />
                                       {isOutOfStock && (
                                          <div className="absolute -left-14 top-8 w-48 transform -rotate-45 bg-red-600 text-white py-1 text-sm font-bold shadow-lg pl-12">
                                             OUT OF STOCK
                                          </div>
                                       )}
                                    </div>
                                 </Link>
                                 <Link
                                    to={`/products/${product._id}`}
                                    className="mb-2 md:mb-4"
                                 >
                                    <h4 className="text-base md:text-xl font-semibold text-gray-800">
                                       {capitalizeFirstLetter(product.name)}
                                    </h4>
                                 </Link>
                                 <div className="mt-auto space-y-2">
                                    <p className={`text-sm md:text-lg text-gray-600 ${isOutOfStock ? 'line-through' : ''}`}>
                                       <span className="font-[inter]">₹</span>
                                       <span>{product.price}</span>
                                    </p>
                                    <button
                                       className="w-full py-2 px-4 rounded-lg transition duration-300 text-sm md:text-base bg-red-600 text-gray-100 hover:bg-red-700"
                                       onClick={() => handleRemove(product._id)}
                                    >
                                       Remove
                                    </button>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               )}
            </div>
         </section>
      </Layout>
   );
};

export default Wishlist;