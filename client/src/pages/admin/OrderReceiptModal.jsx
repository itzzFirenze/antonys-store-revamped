import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetailAction } from "../../Redux/Actions/Order";
import { productAction, productListAction } from "../../Redux/Actions/Product";
import { userListAction } from "../../Redux/Actions/User";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const OrderReceiptModal = ({ isOpen, closeModal, orderId }) => {
   const dispatch = useDispatch();
   const { loading, error, order } = useSelector((state) => state.orderDetailReducer);
   const { loading: productLoading, product } = useSelector((state) => state.productReducer);
   const { products } = useSelector((state) => state.productListReducer);
   const { users } = useSelector((state) => state.userListReducer);

   const [isGenerating, setIsGenerating] = useState(false);

   useEffect(() => {
      if (isOpen && orderId) {
         dispatch(fetchOrderDetailAction(orderId));
      }
   }, [isOpen, orderId, dispatch]);

   useEffect(() => {
      if (order?.productId && order.productId !== "MULTIPLE") {
         dispatch(productAction(order.productId));
      }
      if (order?.orderItems && order.orderItems.length > 0) {
         if (!products || products.length === 0) {
            dispatch(productListAction());
         }
      }
      if (order?.userId) {
         dispatch(userListAction());
      }
   }, [order?.productId, order?.userId, order?.orderItems?.length, dispatch]);

   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => { document.body.style.overflow = 'unset'; };
   }, [isOpen]);

   const getUserDetails = () => {
      if (order?.user && order.user.name && order.user.name !== "Guest User") {
         return {
            name: order.user.name,
            email: order.user.email
         };
      }
      if (!users || !order?.userId) return null;
      return users.find((user) => user._id === order.userId);
   };

   const handlePrint = () => {
      const printContent = document.getElementById('printable-receipt');
      if (!printContent) return;

      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
         .map(s => s.outerHTML)
         .join('');

      const titleName = `${order.orderId} - ${user?.name || 'Customer'}`;
      const printWindow = window.open('', '_blank', 'width=800,height=900');

      if (!printWindow) {
         alert("Please allow popups to print the receipt.");
         return;
      }

      printWindow.document.write(`
         <!DOCTYPE html>
         <html>
         <head>
            <title>${titleName}</title>
            ${styles}
            <style>
               @page { size: auto; margin: 0mm; }
               body { background: white !important; padding: 20mm !important; }
               .no-print { display: none !important; }
            </style>
         </head>
         <body>
            ${printContent.innerHTML}
         </body>
         </html>
      `);
      printWindow.document.close();

      setTimeout(() => {
         printWindow.focus();
         printWindow.print();
         printWindow.close();
      }, 500);
   };

   const handleDownloadPDF = async () => {
      const printContent = document.getElementById('printable-receipt');
      if (!printContent) return;

      setIsGenerating(true);
      try {
         const canvas = await html2canvas(printContent, {
            scale: 2,
            useCORS: true,
            logging: false,
         });

         const imgData = canvas.toDataURL('image/png');
         const pdfWidth = 210;
         const imgWidth = pdfWidth;
         const imgHeight = (canvas.height * pdfWidth) / canvas.width;

         const pdf = new jsPDF('p', 'mm', 'a4');
         pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

         const fileName = `${order.orderId} - ${user?.name || 'Customer'}.pdf`;
         pdf.save(fileName);
      } catch (error) {
         console.error('Error generating PDF:', error);
         alert('Failed to generate PDF. Please try again.');
      } finally {
         setIsGenerating(false);
      }
   };

   if (!isOpen) return null;

   if (loading) {
      return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg text-gray-800 flex items-center font-medium shadow-xl">
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Loading receipt details...
            </div>
         </div>
      );
   }

   if (error || !order) {
      return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg text-red-500">
               {error || "Order not found."}
               <button onClick={closeModal} className="block mt-4 text-blue-500 underline">Close</button>
            </div>
         </div>
      );
   }

   const user = getUserDetails();
   const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' });

   // Prepare Items Data
   let items = [];
   let subtotal = 0;
   const deliveryCharge = 50;

   if (order?.orderItems && order.orderItems.length > 0) {
      items = order.orderItems.map((item) => {
         const p = products?.find(p => p._id === item.productId);
         if (p) subtotal += p.price || 0;
         return {
            name: p ? p.name : "Unknown Product",
            code: p ? (p.productCode || p._id) : item.productId,
            size: item.size || "-",
            price: p ? (p.price || 0) : 0,
            wantStitched: item.wantStitched
         };
      });
   } else if (product) {
      subtotal = product.price || 0;
      items = [{
         name: product.name,
         code: product.productCode || product._id,
         size: order.size || "-",
         price: product.price || 0,
         wantStitched: order.wantStitched
      }];
   }

   const handleWhatsAppPaymentRequest = () => {
      const totalAmount = subtotal + deliveryCharge;
      const message = `Dear Customer, here are the details for your order ${encodeURIComponent(order.orderId)}. The total amount to pay is ₹${totalAmount.toLocaleString('en-IN')}. Please make the payment and send a screenshot of the successful transaction to this number. Please find your bill attached.`;
      
      const whatsappNumber = '91' + (order.phoneNumber?.replace(/\D/g, '') || '');
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`;
      window.open(whatsappUrl, '_blank');
   };

   return (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 py-10 no-print">

         <div className="bg-white shadow-xl max-w-2xl w-full rounded-lg relative overflow-hidden">
            {/* Modal Controls - Hidden in print */}
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200 no-print">
               <h3 className="text-lg font-semibold text-gray-800">Generate Bill</h3>
               <div className="flex gap-2">
                  <button onClick={handleWhatsAppPaymentRequest} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-medium text-sm flex items-center">
                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                     Payment Request
                  </button>
                  <button onClick={handlePrint} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition font-medium text-sm flex items-center">
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                     Print Receipt
                  </button>
                  <button
                     onClick={handleDownloadPDF}
                     disabled={isGenerating}
                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-sm flex items-center disabled:opacity-70"
                  >
                     {isGenerating ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Generating...
                        </>
                     ) : (
                        <>
                           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                           Download PDF
                        </>
                     )}
                  </button>
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-medium text-sm">Close</button>
               </div>
            </div>

            {/* Printable Area */}
            <div id="printable-receipt" className="p-8 bg-white text-gray-900" style={{ minHeight: '600px' }}>
               {/* Header */}
               <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                  <div>
                     <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900">Antony's Boutique</h1>
                     <p className="text-sm text-gray-600 mt-1">Marangattupilly, Near Panchayat, 686635</p>
                     <p className="text-sm text-gray-600">antonysboutiquemgply@gmail.com | +91 9747451884</p>
                  </div>
                  <div className="text-right">
                     <h2 className="text-2xl font-bold text-gray-300 uppercase tracking-widest mb-1">Receipt</h2>
                     <p className="text-sm font-semibold text-gray-800">Order ID: {order.orderId}</p>
                     <p className="text-sm text-gray-600">Date: {orderDate}</p>
                     <p className="text-sm text-gray-600">Status: {order.isPending ? "Not Paid" : "Paid"}</p>
                  </div>
               </div>

               {/* Customer Details */}
               <div className="flex justify-between mb-8">
                  <div className="w-1/2 pr-4">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To:</h3>
                     <p className="font-semibold text-gray-800">{user?.name || "Customer"}</p>
                     <p className="text-sm text-gray-600">{user?.email}</p>
                     <p className="text-sm text-gray-600">{order.phoneNumber}</p>
                  </div>
                  <div className="w-1/2 pl-4">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipped To:</h3>
                     <p className="text-sm text-gray-800 whitespace-pre-wrap">{order.address}</p>
                     <p className="text-sm text-gray-800">Pincode: {order.pincode}</p>
                  </div>
               </div>

               {/* Order Items Table */}
               <table className="w-full text-left mb-8 border-collapse">
                  <thead>
                     <tr className="border-b border-gray-300 text-sm">
                        <th className="py-2 text-gray-600 font-semibold uppercase">Item</th>
                        <th className="py-2 text-gray-600 font-semibold uppercase">Size</th>
                        <th className="py-2 text-gray-600 font-semibold uppercase text-right">Price</th>
                     </tr>
                  </thead>
                  <tbody>
                     {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                           <td className="py-3">
                              <p className="font-medium text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-500">Code: {item.code}</p>
                              {item.wantStitched && <p className="text-xs text-fuchsia-600 mt-0.5">Stitching Required</p>}
                           </td>
                           <td className="py-3 text-gray-800">{item.size}</td>
                           <td className="py-3 text-right text-gray-800 font-medium"><span className="font-[inter]">₹</span>{(item.price || 0).toLocaleString('en-IN')}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>

               {/* Totals */}
               <div className="flex justify-end">
                  <div className="w-1/2 max-w-xs">
                     <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-800 font-medium"><span className="font-[inter]">₹</span>{(subtotal || 0).toLocaleString('en-IN')}</span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Delivery Charge</span>
                        <span className="text-gray-800 font-medium"><span className="font-[inter]">₹</span>{deliveryCharge}</span>
                     </div>
                     <div className="flex justify-between py-3 border-b-2 border-gray-800">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-gray-900 text-lg"><span className="font-[inter]">₹</span>{((subtotal || 0) + deliveryCharge).toLocaleString('en-IN')}</span>
                     </div>
                  </div>
               </div>

               {/* Footer */}
               <div className="mt-12 text-center text-sm text-gray-500">
                  <p>Thank you for shopping with Antony's Boutique!</p>
                  <p>For any queries, please contact us at antonysboutiquemgply@gmail.com</p>
               </div>
            </div>

         </div>
      </div>
   );
};

export default OrderReceiptModal;
