import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { productAction, productListAction } from "../../Redux/Actions/Product";
import { BASE_URL } from "../../Redux/Constants/BASE_URL";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ─── Attach-file toast (same as in OrderReceiptModal) ────────────────────────
const AttachToast = ({ fileName, onDismiss }) => (
   <div
      className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 flex items-start gap-3
                 bg-gray-900 text-white text-sm rounded-xl shadow-2xl px-5 py-4 max-w-sm w-full"
      style={{ animation: 'slideUp 0.3s ease' }}
   >
      <svg className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
      <div className="flex-1">
         <p className="font-semibold text-white mb-0.5">WhatsApp is open!</p>
         <p className="text-gray-300 leading-snug">
            Attach <span className="text-green-400 font-medium">{fileName}</span> from your Downloads folder, then send.
         </p>
      </div>
      <button onClick={onDismiss} className="text-gray-400 hover:text-white transition ml-1 flex-shrink-0">
         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
         </svg>
      </button>
   </div>
);

/**
 * Invisible receipt renderer used to generate the PDF inside ApproveOrderModal.
 * Rendered off-screen (position absolute, left far off viewport) so html2canvas
 * can capture it without it being visible to the user.
 */
const HiddenReceipt = React.forwardRef(({ order, product, products, totalAmount }, ref) => {
   const orderDate = order?.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })
      : '';

   let items = [];
   if (order?.orderItems && order.orderItems.length > 0) {
      items = order.orderItems.map((item) => {
         const p = products?.find(p => p._id === item.productId);
         return {
            name: p ? p.name : "Unknown Product",
            code: p ? (p.productCode || p._id) : item.productId,
            size: item.size || "-",
            price: p ? (p.price || 0) : 0,
         };
      });
   } else if (product) {
      items = [{
         name: product.name,
         code: product.productCode || product._id,
         size: order?.size || "-",
         price: product.price || 0,
      }];
   }

   const subtotal = items.reduce((sum, i) => sum + i.price, 0);
   const deliveryCharge = 50;

   return (
      <div
         ref={ref}
         style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', background: 'white' }}
      >
         <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#111' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111', paddingBottom: '24px', marginBottom: '24px' }}>
               <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Antony's Boutique</div>
                  <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>Marangattupilly, Near Panchayat, 686635</div>
                  <div style={{ fontSize: '13px', color: '#555' }}>antonysboutiquemgply@gmail.com | +91 9747451884</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: '4px' }}>Receipt</div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Order ID: {order?.orderId}</div>
                  <div style={{ fontSize: '13px', color: '#555' }}>Date: {orderDate}</div>
                  <div style={{ fontSize: '13px', color: '#555' }}>Status: Paid</div>
               </div>
            </div>

            {/* Items table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
               <thead>
                  <tr style={{ borderBottom: '1px solid #ccc' }}>
                     <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Item</th>
                     <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Size</th>
                     <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Price</th>
                  </tr>
               </thead>
               <tbody>
                  {items.map((item, idx) => (
                     <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 0' }}>
                           <div style={{ fontWeight: 500 }}>{item.name}</div>
                           <div style={{ fontSize: '12px', color: '#888' }}>Code: {item.code}</div>
                        </td>
                        <td style={{ padding: '12px 0' }}>{item.size}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 500 }}>₹{item.price.toLocaleString('en-IN')}</td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <div style={{ width: '260px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e5e5', fontSize: '14px', color: '#555' }}>
                     <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e5e5', fontSize: '14px', color: '#555' }}>
                     <span>Delivery Charge</span><span>₹{deliveryCharge}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '2px solid #111', fontWeight: 700, fontSize: '16px' }}>
                     <span>Total</span><span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '13px', color: '#888' }}>
               <p>Thank you for shopping with Antony's Boutique!</p>
               <p>For any queries, please contact us at antonysboutiquemgply@gmail.com</p>
            </div>
         </div>
      </div>
   );
});
// ─────────────────────────────────────────────────────────────────────────────

const ApproveOrderModal = ({ isOpen, closeModal, order, onApproveSuccess }) => {
   const dispatch = useDispatch();
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [toastFile, setToastFile] = useState(null);

   const { product } = useSelector((state) => state.productReducer);
   const { products } = useSelector((state) => state.productListReducer);

   const receiptRef = useRef(null);

   useEffect(() => {
      if (isOpen) {
         if (order?.productId && order.productId !== "MULTIPLE") {
            dispatch(productAction(order.productId));
         }
         if (order?.orderItems && order.orderItems.length > 0) {
            if (!products || products.length === 0) {
               dispatch(productListAction());
            }
         }
      }
   }, [isOpen, order?.productId, order?.orderItems?.length, dispatch]);

   // Auto-dismiss toast after 15 s
   useEffect(() => {
      if (!toastFile) return;
      const t = setTimeout(() => setToastFile(null), 15000);
      return () => clearTimeout(t);
   }, [toastFile]);

   if (!isOpen) return null;

   let totalAmount = 50;
   if (order?.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach((item) => {
         const p = products?.find(p => p._id === item.productId);
         if (p) totalAmount += p.price || 0;
      });
   } else if (product) {
      totalAmount += product.price || 0;
   }

   // ── Generate PDF from the hidden receipt ──────────────────────────────────
   const generateAndDownloadPDF = async () => {
      const el = receiptRef.current;
      if (!el) throw new Error('Receipt ref not found');

      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);

      const fileName = `${order.orderId} - Receipt.pdf`;
      pdf.save(fileName);
      return fileName;
   };

   // ── WhatsApp redirect ─────────────────────────────────────────────────────
   const openWhatsApp = () => {
      const message =
         `Dear Customer, we have successfully received your payment of ₹${totalAmount.toLocaleString('en-IN')} ` +
         `for order ${encodeURIComponent(order.orderId)}. Your order is confirmed! ` +
         `Please find your receipt attached. Thank you for shopping with us!`;

      const whatsappNumber = '91' + (order.phoneNumber?.replace(/\D/g, '') || '');
      window.open(`https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`, '_blank');
   };

   // ── Approve handler ───────────────────────────────────────────────────────
   const handleApprove = async () => {
      setLoading(true);
      setError(null);

      try {
         // 1. Approve the order
         const orderResponse = await fetch(`${BASE_URL}/api/orders/${order._id}/approve`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
         });
         if (!orderResponse.ok) throw new Error(`Failed to approve order: ${orderResponse.statusText}`);

         // 3. Generate & download the receipt PDF
         const fileName = await generateAndDownloadPDF();

         // 4. Open WhatsApp with the confirmation message
         openWhatsApp();

         // 5. Show the attach-file toast
         setToastFile(fileName);

         onApproveSuccess();
         dispatch(productAction(order.productId));
         closeModal();
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <>
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-800">
               {/* Modal Header */}
               <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mark as Paid</h3>
                  <button type="button" onClick={closeModal} className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                  </button>
               </div>

               {/* Modal Body */}
               <div className="p-6">
                  <div className="mb-4 text-gray-700 dark:text-gray-300">
                     <p className="mb-2">Order ID: {order.orderId}</p>
                     <p className="mb-4">Total Amount: ₹{totalAmount.toLocaleString('en-IN')}</p>
                     <p>Are you sure you want to mark this order as paid? This will:</p>
                  </div>
                  <ul className="mb-4 ml-4 list-disc text-gray-700 dark:text-gray-300">
                     <li>Mark the order as paid in the system</li>
                     <li>Download the receipt PDF to your device</li>
                     <li>Open WhatsApp with a pre-loaded payment confirmation message</li>
                  </ul>

                  {error && (
                     <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
                  )}

                  <div className="flex justify-end space-x-4">
                     <button
                        type="button"
                        onClick={handleApprove}
                        disabled={loading}
                        className={`text-gray-100 bg-green-500 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                     >
                        {loading ? "Processing..." : "Mark as Paid"}
                     </button>
                     <button
                        type="button"
                        onClick={closeModal}
                        className="text-gray-600 bg-gray-100 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg text-sm px-5 py-2.5 text-center"
                     >
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Off-screen receipt for PDF generation */}
         <HiddenReceipt
            ref={receiptRef}
            order={order}
            product={product}
            products={products}
            totalAmount={totalAmount}
         />

         {/* Attach-file toast */}
         {toastFile && (
            <AttachToast fileName={toastFile} onDismiss={() => setToastFile(null)} />
         )}

         <style>{`
            @keyframes slideUp {
               from { opacity: 0; transform: translate(-50%, 20px); }
               to   { opacity: 1; transform: translate(-50%, 0); }
            }
         `}</style>
      </>
   );
};

export default ApproveOrderModal;