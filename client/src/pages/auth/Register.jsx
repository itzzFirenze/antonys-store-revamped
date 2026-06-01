import { useState, useEffect } from "react";
import Layout from "../../layouts/Layouts";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
   userRegisterAction,
   checkEmailExistsAction,
   sendVerificationCodeAction,
   verifyCodeAndRegisterAction
} from "../../Redux/Actions/User";
import {
   USER_REGISTER_RESET,
   SEND_VERIFICATION_CODE_REQUEST,
   VERIFY_CODE_REQUEST
} from "../../Redux/Constants/User";
import { SpinnerLoading } from "../../components/Spinner";
import { Link } from "react-router-dom";

export default function Register() {
   const [email, setEmail] = useState("");
   const [name, setName] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [emailError, setEmailError] = useState("");
   const [passwordError, setPasswordError] = useState("");
   const [generalError, setGeneralError] = useState("");
   const [step, setStep] = useState(1); // 1 = registration form, 2 = verification code
   const [verificationCode, setVerificationCode] = useState("");
   const [verificationError, setVerificationError] = useState("");
   const [codeSent, setCodeSent] = useState(false);

   const dispatch = useDispatch();
   const navigate = useNavigate();

   const userRegisterReducer = useSelector((state) => state.userRegisterReducer);
   const { loading, error, userInfo } = userRegisterReducer;

   // Get loading state from verification code reducer
   const verificationCodeReducer = useSelector((state) => state.verificationCodeReducer || {});
   const verificationLoading = verificationCodeReducer.loading || false;

   useEffect(() => {
      dispatch({ type: USER_REGISTER_RESET });
      setEmailError("");
      setPasswordError("");
      setGeneralError("");
      setVerificationError("");

      return () => {
         dispatch({ type: USER_REGISTER_RESET });
         setEmailError("");
         setPasswordError("");
         setGeneralError("");
         setVerificationError("");
      };
   }, [dispatch]);

   useEffect(() => {
      if (userInfo) {
         navigate('/');
      }
   }, [userInfo, navigate]);

   // Reset local errors when Redux error changes
   useEffect(() => {
      if (!error) {
         setEmailError("");
         setGeneralError("");
         return;
      }

      if (error.includes("Email is already registered")) {
         setEmailError(error);
         // If we receive this error, make sure we reset to step 1
         setStep(1);
      } else {
         setGeneralError(error);
      }
   }, [error]);

   const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

   const clearAllErrors = () => {
      setEmailError("");
      setPasswordError("");
      setGeneralError("");
      setVerificationError("");
      dispatch({ type: USER_REGISTER_RESET });
   };

   const submitHandler = async (e) => {
      e.preventDefault();
      clearAllErrors();
   
      if (!emailPattern.test(email)) {
         setEmailError("Please enter a valid email address.");
         return;
      }
   
      if (password.length < 6) {
         setPasswordError("Password must be at least 6 characters long");
         return;
      }
   
      if (password !== confirmPassword) {
         setPasswordError("Passwords do not match");
         return;
      }
   
      try {
         // Send verification code
         const result = await dispatch(sendVerificationCodeAction(email));
         
         if (result.success) {
            // Code sent successfully, move to verification step
            setStep(2);
            setCodeSent(true);
         } else {
            // Handle specific error
            if (result.message.includes("Email is already registered")) {
               setEmailError(result.message);
            } else {
               setGeneralError(result.message || "Failed to send verification code. Please try again.");
            }
         }
      } catch (err) {
         setGeneralError("An error occurred while sending verification code");
      }
   };

   const verifyAndRegister = async (e) => {
      e.preventDefault();
      setVerificationError("");
   
      if (verificationCode.length !== 4) {
         setVerificationError("Please enter a valid 4-digit code");
         return;
      }
   
      try {
         // Verify code and register user
         const success = await dispatch(verifyCodeAndRegisterAction(email, verificationCode, name, password));
   
         if (!success) {
            setVerificationError("Invalid or expired verification code");
         }
      } catch (err) {
         setVerificationError("An error occurred while verifying your code");
      }
   };

   const handleEmailChange = (e) => {
      setEmail(e.target.value);
      clearAllErrors();
   };

   const handleNameChange = (e) => {
      setName(e.target.value);
      clearAllErrors();
   };

   const handlePasswordChange = (e) => {
      setPassword(e.target.value);
      clearAllErrors();
   };

   const handleConfirmPasswordChange = (e) => {
      setConfirmPassword(e.target.value);
      clearAllErrors();
   };

   const handleVerificationCodeChange = (e) => {
      setVerificationCode(e.target.value);
      setVerificationError("");
   };

   const goBack = () => {
      setStep(1);
      setVerificationCode("");
      setVerificationError("");
   };

   const resendCode = async () => {
      setVerificationError("");
      try {
         const success = await dispatch(sendVerificationCodeAction(email));
         if (success) {
            setCodeSent(true);
         }
      } catch (err) {
         setVerificationError("Failed to resend verification code");
      }
   };

   return (
      <Layout>
         {loading || verificationLoading ? (
            <SpinnerLoading />
         ) : (
            <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center mt-8">
               <div className="flex flex-col items-center justify-center px-6 py-8 w-full">
                  <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                     <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                           {step === 1 ? "Register your account" : "Verify your email"}
                        </h1>

                        {step === 1 ? (
                           <form className="space-y-4 md:space-y-6" onSubmit={submitHandler}>
                              <div>
                                 <label
                                    htmlFor="name"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                 >
                                    Name
                                 </label>
                                 <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-fuchsia-800 focus:border-fuchsia-800 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-fuchsia-700 dark:focus:border-fuchsia-700"
                                    placeholder="eg. John"
                                    required
                                    value={name}
                                    onChange={handleNameChange}
                                 />
                              </div>
                              <div>
                                 <label
                                    htmlFor="email"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                 >
                                    Your email
                                 </label>
                                 <input
                                    type="text"
                                    name="email"
                                    id="email"
                                    className={`bg-gray-50 border ${emailError ? "border-red-500" : "border-gray-300"} text-gray-900 rounded-lg focus:ring-fuchsia-800 focus:border-fuchsia-800 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-fuchsia-700 dark:focus:border-fuchsia-700`}
                                    placeholder="eg. name@gmail.com"
                                    required
                                    value={email}
                                    onChange={handleEmailChange}
                                 />
                                 {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                              </div>
                              <div>
                                 <label
                                    htmlFor="password"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                 >
                                    Password
                                 </label>
                                 <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="password"
                                    className={`bg-gray-50 border ${passwordError ? "border-red-500" : "border-gray-300"} text-gray-900 rounded-lg focus:ring-fuchsia-800 focus:border-fuchsia-800 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-fuchsia-700 dark:focus:border-fuchsia-700`}
                                    required
                                    value={password}
                                    onChange={handlePasswordChange}
                                 />
                              </div>
                              <div>
                                 <label
                                    htmlFor="confirm-password"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                 >
                                    Confirm Password
                                 </label>
                                 <input
                                    type="password"
                                    name="confirm-password"
                                    id="confirm-password"
                                    placeholder="confirm password"
                                    className={`bg-gray-50 border ${passwordError ? "border-red-500" : "border-gray-300"} text-gray-900 rounded-lg focus:ring-fuchsia-800 focus:border-fuchsia-800 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-fuchsia-700 dark:focus:border-fuchsia-700`}
                                    required
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                 />
                                 {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                              </div>
                              {generalError && <p className="text-red-500 text-sm">{generalError}</p>}
                              <button
                                 type="submit"
                                 className="w-full text-gray-100 bg-fuchsia-800 hover:bg-fuchsia-900 focus:ring-4 focus:outline-none focus:ring-fuchsia-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-fuchsia-800 dark:hover:bg-fuchsia-900 dark:focus:ring-fuchsia-900"
                              >
                                 Next
                              </button>
                              <p className="text-sm font-light text-gray-800 dark:text-gray-400">
                                 Already have an account?{" "}
                                 <Link
                                    to="/login"
                                    className="font-medium text-fuchsia-800 hover:underline dark:text-primary-500"
                                 >
                                    Sign in
                                 </Link>
                              </p>
                           </form>
                        ) : (
                           <form className="space-y-4 md:space-y-6" onSubmit={verifyAndRegister}>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                 We've sent a verification code to {email}. Please enter the 4-digit code below.
                              </p>
                              <div>
                                 <label
                                    htmlFor="verification-code"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                 >
                                    Verification Code
                                 </label>
                                 <input
                                    type="text"
                                    name="verification-code"
                                    id="verification-code"
                                    className={`bg-gray-50 border ${verificationError ? "border-red-500" : "border-gray-300"} text-gray-900 rounded-lg focus:ring-fuchsia-800 focus:border-fuchsia-800 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-fuchsia-700 dark:focus:border-fuchsia-700`}
                                    placeholder="Enter 4-digit code"
                                    maxLength="4"
                                    required
                                    value={verificationCode}
                                    onChange={handleVerificationCodeChange}
                                 />
                                 {verificationError && <p className="text-red-500 text-sm mt-1">{verificationError}</p>}
                              </div>
                              <div className="flex flex-col gap-3">
                                 <div className="flex flex-row gap-3">
                                    <button
                                       type="button"
                                       onClick={goBack}
                                       className="w-1/3 text-gray-900 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                    >
                                       Back
                                    </button>
                                    <button
                                       type="submit"
                                       className="w-2/3 text-gray-100 bg-fuchsia-800 hover:bg-fuchsia-900 focus:ring-4 focus:outline-none focus:ring-fuchsia-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-fuchsia-800 dark:hover:bg-fuchsia-900 dark:focus:ring-fuchsia-900"
                                    >
                                       Verify & Register
                                    </button>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={resendCode}
                                    className="w-full text-fuchsia-800 bg-transparent hover:bg-gray-100 border border-fuchsia-800 focus:ring-4 focus:outline-none focus:ring-fuchsia-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                 >
                                    Resend Code
                                 </button>
                              </div>
                              <p className="text-sm font-light text-center text-gray-600 dark:text-gray-400">
                                 Didn't receive the code? Check your spam folder or click "Resend Code"
                              </p>
                           </form>
                        )}
                     </div>
                  </div>
               </div>
            </section>
         )}
      </Layout>
   );
}