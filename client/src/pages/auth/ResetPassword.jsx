import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearPasswordResetError } from '../../Redux/Actions/User';
import Layout from '../../layouts/Layouts';
import { SpinnerLoading } from '../../components/Spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const Toast = ({ message, type, onClose, onConfirm }) => {
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
         <div className="relative z-10 animate-in fade-in zoom-in duration-200">
            <div className={`flex flex-col p-6 min-w-[320px] rounded-lg shadow-lg ${type === 'success' ? 'bg-white text-green-800' : 'bg-white text-red-800'
               }`}>
               <div className="flex items-center mb-4">
                  <div className="mr-3">
                     {type === 'success' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                     ) : (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                     )}
                  </div>
                  <div className="flex-1 text-base font-medium">{message}</div>
               </div>
               <button
                  onClick={onConfirm}
                  className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-fuchsia-800 rounded-md hover:bg-fuchsia-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-700 focus:ring-offset-2"
               >
                  OK
               </button>
            </div>
         </div>
      </div>
   );
};

export const ResetPassword = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const dispatch = useDispatch();
   
   const [resetCode, setResetCode] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showSpinner, setShowSpinner] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   const [email, setEmail] = useState(location.state?.email || '');
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState('');
   const [toastType, setToastType] = useState('success');

   const passwordReset = useSelector((state) => state.passwordResetReducer);
   const { loading, error, success } = passwordReset;

   // Clear errors when component mounts or unmounts
   useEffect(() => {
      dispatch(clearPasswordResetError());
      setErrorMessage('');
      
      return () => {
         dispatch(clearPasswordResetError());
      };
   }, [dispatch]);

   // Clear errors when email changes
   useEffect(() => {
      dispatch(clearPasswordResetError());
      setErrorMessage('');
   }, [email, dispatch]);

   // Handle missing email
   useEffect(() => {
      if (!location.state?.email) {
         setErrorMessage("No email provided. Please try the forgot password process again.");
         const timer = setTimeout(() => {
            navigate('/login');
         }, 3000);
         return () => clearTimeout(timer);
      }
   }, [location.state, navigate]);

   // Handle loading state
   useEffect(() => {
      if (loading) {
         setShowSpinner(true);
      } else {
         const timer = setTimeout(() => {
            setShowSpinner(false);
         }, 300);
         return () => clearTimeout(timer);
      }
   }, [loading]);

   const handleToastConfirm = () => {
      setShowToast(false);
      if (toastType === 'success') {
         navigate('/login');
      }
   };

   const handleResetPassword = async (e) => {
      e.preventDefault();
      setErrorMessage('');
      dispatch(clearPasswordResetError());

      if (!email) {
         setErrorMessage("Email information is missing. Please try again from the login page.");
         return;
      }

      if (newPassword !== confirmPassword) {
         setErrorMessage("Passwords don't match!");
         return;
      }

      if (newPassword.length < 6) {
         setErrorMessage("Password must be at least 6 characters long");
         return;
      }

      try {
         const result = await dispatch(resetPassword(email, resetCode, newPassword));
         if (result) {
            setToastMessage('Password reset successful! Please login with your new password.');
            setToastType('success');
            setShowToast(true);
         }
      } catch (error) {
         setToastType('error');
         setToastMessage('Failed to reset password. Please try again.');
         setShowToast(true);
      }
   };

   return (
      <Layout>
         {showToast && (
            <Toast
               message={toastMessage}
               type={toastType}
               onClose={() => setShowToast(false)}
               onConfirm={handleToastConfirm}
            />
         )}
         {loading || showSpinner ? (
            <SpinnerLoading />
         ) : (
            <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
               <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full">
                  <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                     <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                           Reset Your Password
                        </h1>

                        {(error || errorMessage) && (
                           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                              <span className="block sm:inline">{error || errorMessage}</span>
                           </div>
                        )}

                        <form className="space-y-4 md:space-y-6" onSubmit={handleResetPassword}>
                           <div>
                              <label htmlFor="resetCode" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                 Enter Reset Code
                              </label>
                              <input
                                 type="text"
                                 name="resetCode"
                                 id="resetCode"
                                 className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-fuchsia-800 focus:border-fuchsia-800 block w-full p-2.5"
                                 required
                                 value={resetCode}
                                 onChange={(e) => setResetCode(e.target.value)}
                                 placeholder="Enter the code sent to your email"
                              />
                           </div>
                           <div>
                              <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                 New Password
                              </label>
                              <input
                                 type="password"
                                 name="newPassword"
                                 id="newPassword"
                                 className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-fuchsia-800 focus:border-fuchsia-800 block w-full p-2.5"
                                 required
                                 value={newPassword}
                                 onChange={(e) => setNewPassword(e.target.value)}
                                 placeholder="Enter new password"
                              />
                           </div>
                           <div>
                              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                 Confirm Password
                              </label>
                              <input
                                 type="password"
                                 name="confirmPassword"
                                 id="confirmPassword"
                                 className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-fuchsia-800 focus:border-fuchsia-800 block w-full p-2.5"
                                 required
                                 value={confirmPassword}
                                 onChange={(e) => setConfirmPassword(e.target.value)}
                                 placeholder="Confirm new password"
                              />
                           </div>
                           <button
                              type="submit"
                              className="w-full text-white bg-fuchsia-800 hover:bg-fuchsia-900 focus:ring-4 focus:outline-none focus:ring-fuchsia-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                           >
                              Reset Password
                           </button>
                        </form>
                     </div>
                  </div>
               </div>
            </section>
         )}
      </Layout>
   );
};