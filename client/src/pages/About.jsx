import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import Layout from "../layouts/Layouts";

const About = () => {
   const location = useLocation();

   useEffect(() => {
      window.scrollTo(0, 0);
    }, [location]);

   useEffect(() => {
      AOS.init({ duration: 1000 });
   }, []);

   return (
      <Layout>
         <section
            className="mb-32 text-gray-100 py-48 relative flex items-center justify-center"
            style={{
               backgroundImage: 'url("/images/about-welcome.jpg")',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
            }}
         >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30" />

            {/* Blur effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60 backdrop-blur-md" />

            {/* About Us Header */}
            <div className="text-center mb-16 px-6 relative z-10" data-aos="fade-up">
               <h2 className="text-4xl font-extrabold leading-tight mb-4">Welcome to Antony's Boutique</h2>
               <p className="text-lg md:text-xl">
                  Celebrating 10 years of delivering elegance, style, and comfort with our wide range of clothing and custom services.
               </p>
            </div>

            {/* Scroll Icon */}
            <div className="absolute bottom-8 flex justify-center w-full z-10">
               <div
                  className="flex flex-col items-center text-gray-100 animate-slow-bounce"
               >
                  <span className="text-sm mb-1">Scroll Down</span>
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                     className="w-6 h-6"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                     />
                  </svg>
               </div>
            </div>
         </section>

         <section id="about-content" className="container mx-auto px-6 md:px-12 max-w-7xl">
            {/* Our Story Section */}
            <div className="text-center mb-16" data-aos="fade-up">
               <h3 className="text-3xl font-semibold text-fuchsia-800 mb-6">Our Story</h3>
               <p className="text-neutral-500 text-lg leading-relaxed">
                  For the past decade, Antony's Boutique has been a trusted name in fashion, offering a curated selection of ready-made churidars, shawls, leggings, and more. From our humble beginnings, we have always focused on quality, craftsmanship, and customer satisfaction. Whether you're looking for the perfect ready-made outfit or require custom tailoring, we are here to ensure you look and feel your best.
               </p>
            </div>

            {/* Our Products Section */}
            <div className="flex justify-center items-center mb-16" data-aos="fade-up">
               <div className="w-full md:w-10/12 lg:w-8/12 text-center">
                  <h3 className="text-3xl font-semibold text-fuchsia-800 mb-6">Our Products</h3>
                  <p className="text-neutral-500 text-lg mb-8">
                     We pride ourselves on offering high-quality, stylish, and comfortable clothing. Our range of products includes:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     <div className="relative overflow-hidden shadow-lg rounded-xl">
                        <img
                           src="/images/ready-made-churidar.jpeg"
                           alt="Churidars"
                           className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 text-gray-100 p-4">
                           <h4 className="text-xl font-semibold">Ready-Made Churidars</h4>
                        </div>
                     </div>
                     <div className="relative overflow-hidden shadow-lg rounded-xl">
                        <img
                           src="/images/shawl.jpg"
                           alt="Shawls"
                           className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 text-gray-100 p-4">
                           <h4 className="text-xl font-semibold">Shawls</h4>
                        </div>
                     </div>
                     <div className="relative overflow-hidden shadow-lg rounded-xl">
                        <img
                           src="/images/leggings.jpg"
                           alt="Leggings"
                           className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 text-gray-100 p-4">
                           <h4 className="text-xl font-semibold">Leggings & Pants</h4>
                        </div>
                     </div>
                     <div className="relative overflow-hidden shadow-lg rounded-xl">
                        <img
                           src="/images/ready-to-stitch-churidar.jpeg"
                           alt="Churidar Sets"
                           className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 text-gray-100 p-4">
                           <h4 className="text-xl font-semibold">Ready-to-Stitch Churidar Sets</h4>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Our Services Section */}
            <div className="flex justify-center items-center mb-16" data-aos="fade-up">
               <div className="w-full text-center">
                  <h3 className="text-3xl font-semibold text-fuchsia-800 mb-6">Our Services</h3>
                  <p className="text-neutral-500 text-lg mb-8">
                     We don't just sell clothing - we provide tailored experiences to make sure your outfits fit perfectly. Our expert tailoring and stitching services include:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     <div className="p-6 rounded-xl bg-white shadow-lg">
                        <h4 className="text-xl font-semibold mb-4">Custom Stitching</h4>
                        <p className="text-neutral-500">
                           From churidars to blouses, we offer custom stitching services to make your outfit uniquely yours.
                        </p>
                     </div>
                     <div className="p-6 rounded-xl bg-white shadow-lg">
                        <h4 className="text-xl font-semibold mb-4">Alterations</h4>
                        <p className="text-neutral-500">
                           Need alterations? We’ll ensure your outfit fits perfectly and comfortably.
                        </p>
                     </div>
                     <div className="p-6 rounded-xl bg-white shadow-lg">
                        <h4 className="text-xl font-semibold mb-4">Personalized Fitting</h4>
                        <p className="text-neutral-500">
                           Our team will work with you to ensure the perfect fit for every outfit, enhancing your comfort and confidence.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Our Values Section */}
            <div className="text-center mb-16" data-aos="fade-up">
               <h3 className="text-3xl font-semibold text-fuchsia-800 mb-6">Our Values</h3>
               <p className="text-neutral-500 text-lg leading-relaxed mb-8">
                  At Antony's Boutique, we believe in integrity, excellence, and customer-first service. Our boutique has been built on these values, and we continue to provide fashion that is as timeless as it is beautiful.
               </p>
               <p className="text-neutral-500 text-lg leading-relaxed">
                  Thank you for trusting us with your fashion needs. We look forward to many more years of serving you with the finest clothing and services.
               </p>
            </div>
         </section>
      </Layout>
   );
};

export default About;