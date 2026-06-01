import { useDispatch, useSelector } from "react-redux";
import Layout from "../../layouts/Layouts";
import { useState, useEffect } from "react";
import { userLoginAction, clearLoginError } from "../../Redux/Actions/User";
import { SpinnerLoading } from "../../components/Spinner";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { BASE_URL } from "../../Redux/Constants/BASE_URL";

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

export default function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [errorMessage, setErrorMessage] = useState("");
   const userLoginReducer = useSelector((state) => state.userLoginReducer);
   const [showSpinner, setShowSpinner] = useState(false);
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState('');
   const [toastType, setToastType] = useState('success');

   const { loading, error } = userLoginReducer;
   const dispatch = useDispatch();
   const navigate = useNavigate();

   // Clear errors when component mounts or unmounts
   useEffect(() => {
      dispatch(clearLoginError());
      setErrorMessage('');

      // Cleanup function to clear errors when component unmounts
      return () => {
         dispatch(clearLoginError());
      };
   }, []); // Empty dependency array means this runs on mount and unmount only

   // Clear errors when navigating away
   useEffect(() => {
      return () => {
         dispatch(clearLoginError());
         setErrorMessage('');
      };
   }, [dispatch]);

   const submitHandler = async (e) => {
      e.preventDefault();
      setErrorMessage(''); // Clear any existing errors
      dispatch(clearLoginError());
      try {
         await dispatch(userLoginAction(email, password));
         // If login is successful, the reducer will handle the state update
      } catch (error) {
         setErrorMessage(error.response?.data?.message || "An error occurred during login");
      }
   };

   const handleToastConfirm = () => {
      setShowToast(false);
      if (toastType === 'success') {
         navigate("/reset-password", {
            state: { email: email }
         });
      }
   };

   const handleForgotPassword = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      setErrorMessage("");

      if (!email) {
         setErrorMessage("Please enter your email address to reset password");
         return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
         setErrorMessage("Please enter a valid email address");
         return;
      }

      try {
         setShowSpinner(true);
         const response = await fetch(`${BASE_URL}/api/users/forgot-password`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
         });
         const data = await response.json();

         if (response.ok) {
            setToastMessage(`Reset code sent to: ${email}`);
            setToastType('success');
            setShowToast(true);
         } else {
            setToastType('error');
            setToastMessage(data.message || "An error occurred. Please try again.");
            setShowToast(true);
         }
      } catch (error) {
         console.error("Error during forgot password:", error);
         setToastType('error');
         setToastMessage("Server error. Please try again later.");
         setShowToast(true);
      } finally {
         setShowSpinner(false);
      }
   };

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
               <div className="flex flex-col items-center justify-center px-6 py-6 w-full">
                  <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                     <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                           Sign in to your account
                        </h1>
                        {(error || errorMessage) && (
                           <div
                              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                              role="alert"
                           >
                              <span className="block sm:inline">{error || errorMessage}</span>
                           </div>
                        )}
                        <form className="space-y-4 md:space-y-6" onSubmit={submitHandler}>
                           <div>
                              <label
                                 htmlFor="email"
                                 className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                 Your email
                              </label>
                              <input
                                 type="email"
                                 name="email"
                                 id="email"
                                 className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-fuchsia-800 focus:border-fuchsia-800 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-fuchsia-700 dark:focus:border-fuchsia-700"
                                 placeholder="eg. name@gmail.com"
                                 required
                                 value={email}
                                 onChange={(e) => setEmail(e.target.value)}
                              />
                           </div>
                           <div>
                              <label
                                 htmlFor="password"
                                 className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                 Password
                              </label>
                              <div className="relative">
                                 <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    placeholder="password"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-fuchsia-800 focus:border-fuchsia-800 block w-full p-2.5 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-fuchsia-700 dark:focus:border-fuchsia-700"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                 />
                                 <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                 >
                                    {showPassword ? (
                                       <EyeOff className="w-5 h-5" />
                                    ) : (
                                       <Eye className="w-5 h-5" />
                                    )}
                                 </button>
                              </div>
                           </div>
                           <div className="flex items-center justify-between">
                              <button
                                 type="button"
                                 onClick={handleForgotPassword}
                                 className="text-sm font-medium text-fuchsia-800 hover:underline dark:text-fuchsia-700"
                              >
                                 Forgot password?
                              </button>
                           </div>
                           <button
                              type="submit"
                              className="w-full text-gray-100 bg-fuchsia-800 hover:bg-fuchsia-900 focus:ring-4 focus:outline-none focus:ring-fuchsia-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-fuchsia-800 dark:hover:bg-fuchsia-900 dark:focus:ring-fuchsia-900"
                           >
                              Sign in
                           </button>
                           <p className="text-sm font-light text-gray-800 dark:text-gray-400">
                              Don't have an account yet?{" "}
                              <Link
                                 to="/register"
                                 className="font-medium text-fuchsia-800 hover:underline dark:text-primary-500"
                              >
                                 Sign up
                              </Link>
                           </p>
                        </form>
                     </div>
                  </div>
               </div>
            </section>
         )}
      </Layout>
   );
}