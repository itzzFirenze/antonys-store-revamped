import axios from "axios";
import {
   USER_LOGIN_REQ,
   USER_LOGIN_REQ_SUCCESS,
   USER_LOGIN_REQ_FAIL,
   USER_LOGOUT,

   USER_REGISTER_REQ,
   USER_REGISTER_REQ_SUCCESS,
   USER_REGISTER_REQ_FAIL,

   USER_LIST_FAIL,
   USER_LIST_REQUEST,
   USER_LIST_RESET,
   USER_LIST_SUCCESS,

   USER_ADMIN_TOGGLE_FAIL,
   USER_ADMIN_TOGGLE_REQUEST,
   USER_ADMIN_TOGGLE_SUCCESS,

   USER_DELETE_REQUEST,
   USER_DELETE_SUCCESS,
   USER_DELETE_FAIL,

   USER_PROFILE_UPDATE_FAIL,
   USER_PROFILE_UPDATE_REQUEST,
   USER_PROFILE_UPDATE_RESET,
   USER_PROFILE_UPDATE_SUCCESS,

   PASSWORD_RESET_CODE_FAIL,
   PASSWORD_RESET_CODE_REQUEST,
   PASSWORD_RESET_CODE_SUCCESS,

   PASSWORD_RESET_FAIL,
   PASSWORD_RESET_REQUEST,
   PASSWORD_RESET_SUCCESS,

   USER_LOGIN_CLEAR_ERROR,
   USER_PROFILE_ERROR_CLEAR,

   SEND_VERIFICATION_CODE_REQUEST,
   SEND_VERIFICATION_CODE_FAIL,
   SEND_VERIFICATION_CODE_SUCCESS,

   VERIFY_CODE_FAIL,
   VERIFY_CODE_REQUEST,
   VERIFY_CODE_SUCCESS

} from "../Constants/User";
import { BASE_URL } from "../Constants/BASE_URL";


//User login action
export const userLoginAction = (email, password) => async (dispatch) => {
   try {
      dispatch({ type: USER_LOGIN_REQ });

      const config = {
         headers: {
            "Content-Type": "application/json",
         }
      };

      const { data } = await axios.post(`${BASE_URL}/api/users/login`, { email, password }, config);

      // Store token in localStorage directly
      localStorage.setItem("accessToken", data.token);

      localStorage.setItem("userInfo", JSON.stringify({
         _id: data._id,
         name: data.name,
         email: data.email,
         isAdmin: data.isAdmin,
         token: data.token,  // Keep for consistency
         mobNum: data.mobNum,
         address: data.address,
         pincode: data.pincode
      }));

      dispatch({
         type: USER_LOGIN_REQ_SUCCESS,
         payload: data
      });
   } catch (error) {
      dispatch({
         type: USER_LOGIN_REQ_FAIL,
         payload: error.response?.data?.message || "An error occurred during login"
      });
   }
};


// Clear invalid email and password error
export const clearLoginError = () => ({
   type: USER_LOGIN_CLEAR_ERROR
});


// User logout action
export const userLogoutAction = () => async (dispatch) => {
   localStorage.removeItem("userInfo");
   localStorage.removeItem("accessToken");
   dispatch({ type: USER_LOGOUT });
   dispatch({ type: USER_LIST_RESET });
   window.location.reload();
};


// Email exist check
export const checkEmailExistsAction = (email) => async (dispatch) => {
   try {
      dispatch({
         type: "CHECK_EMAIL_REQ",
      });

      const config = {
         headers: {
            "Content-Type": "application/json",
         }
      };

      await axios.post(
         `${BASE_URL}/api/users/check-email`,
         { email },
         config
      );

      dispatch({
         type: "CHECK_EMAIL_SUCCESS",
      });

      return { success: true }; // Email is available

   } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;

      dispatch({
         type: "CHECK_EMAIL_FAIL",
         payload: errorMessage,
      });

      return {
         success: false,
         message: errorMessage
      }; // Return the error message
   }
};

// Action to send verification code
export const sendVerificationCodeAction = (email) => async (dispatch) => {
   try {
      dispatch({
         type: SEND_VERIFICATION_CODE_REQUEST,
      });

      const config = {
         headers: {
            "Content-Type": "application/json",
         }
      };

      await axios.post(
         `${BASE_URL}/api/users/send-verification-code`,
         { email },
         config
      );

      dispatch({
         type: SEND_VERIFICATION_CODE_SUCCESS,
      });

      return { success: true }; // Code sent successfully
   } catch (error) {
      console.log("Verification code error:", error);
      console.log("Error response data:", error.response?.data);

      const errorMessage = error.response?.data?.message || error.message;

      dispatch({
         type: SEND_VERIFICATION_CODE_FAIL,
         payload: errorMessage,
      });

      return {
         success: false,
         message: errorMessage
      }; // Return the specific error message
   }
};


// Action to verify code and register user
export const verifyCodeAndRegisterAction = (email, code, name, password) => async (dispatch) => {
   try {
      dispatch({
         type: VERIFY_CODE_REQUEST,
      });
      const config = {
         headers: {
            "Content-Type": "application/json",
         }
      };
      const { data } = await axios.post(
         `${BASE_URL}/api/users/verify-code`,
         { email, code, name, password },
         config
      );
      // Store the token consistently
      const token = data.token;
      localStorage.setItem("accessToken", token);
      // Store user info with the token
      const userInfo = {
         _id: data._id,  // Changed from *id to _id
         name: data.name,
         email: data.email,
         isAdmin: data.isAdmin,
         token: token
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      dispatch({
         type: VERIFY_CODE_SUCCESS,
         payload: userInfo
      });
      dispatch({
         type: USER_LOGIN_REQ_SUCCESS,
         payload: userInfo
      });
      return true;
   } catch (error) {
      console.error("Verification error:", error);  // Add this for debugging
      dispatch({
         type: VERIFY_CODE_FAIL,
         payload: error.response?.data?.message || error.message,
      });
      return false;
   }
};


//Register
export const userRegisterAction = (name, email, password) => async (dispatch) => {
   try {
      dispatch({
         type: USER_REGISTER_REQ,
      });
      const config = {
         headers: {
            "Content-Type": "application/json",
         }
      };
      const { data } = await axios.post(
         `${BASE_URL}/api/users`,
         { name, email, password },
         config
      );
      // Store the token consistently
      const token = data.token;
      localStorage.setItem("accessToken", token);
      // Store user info with the token
      const userInfo = {
         _id: data._id,  // Changed from *id to _id
         name: data.name,
         email: data.email,
         isAdmin: data.isAdmin,
         token: token
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      dispatch({
         type: USER_REGISTER_REQ_SUCCESS,
         payload: userInfo
      });
      dispatch({
         type: USER_LOGIN_REQ_SUCCESS,
         payload: userInfo
      });
   } catch (error) {
      dispatch({
         type: USER_REGISTER_REQ_FAIL,
         payload: error.response?.data?.message || error.message,
      });
   }
};

// User list
export const userListAction = () => async (dispatch) => {
   try {
      dispatch({ type: USER_LIST_REQUEST });

      // Get token from userInfo if accessToken is not found
      let token = localStorage.getItem("accessToken");
      if (!token) {
         const userInfo = JSON.parse(localStorage.getItem("userInfo"));
         token = userInfo?.token;

         // Store it in accessToken if found
         if (token) {
            localStorage.setItem("accessToken", token);
         } else {
            throw new Error("No authentication token found");
         }
      }

      const config = {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      };

      const { data } = await axios.get(`${BASE_URL}/api/users`, config);

      dispatch({ type: USER_LIST_SUCCESS, payload: data });
   } catch (error) {
      if (error.response?.status === 401) {
         // If unauthorized, logout user
         dispatch({ type: USER_LOGOUT });
         dispatch({
            type: USER_LIST_FAIL,
            payload: "Session expired. Please login again.",
         });
      } else {
         dispatch({
            type: USER_LIST_FAIL,
            payload: error.response?.data?.message || error.message,
         });
      }
   }
};


// Toggle admin access
export const toggleAdminAction = (userId, isAdmin) => async (dispatch) => {
   try {
      dispatch({ type: USER_ADMIN_TOGGLE_REQUEST });

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
         throw new Error("No authentication token found");
      }

      const config = {
         method: 'put',
         url: `${BASE_URL}/api/users/${userId}`,
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
         },
         data: { isAdmin }
      };

      try {
         await axios(config);
      } catch (error) {
         if (error.response?.status === 401) {
            // If unauthorized, try to refresh token and retry
            await refreshTokenAndRetry(config);
         } else {
            throw error;
         }
      }

      // Refresh user list after successful toggle
      dispatch(userListAction());
      dispatch({ type: USER_ADMIN_TOGGLE_SUCCESS });

   } catch (error) {
      dispatch({
         type: USER_ADMIN_TOGGLE_FAIL,
         payload: error.message || "Failed to toggle admin status"
      });

      // If error is due to authentication, logout user
      if (error.message === "Session expired. Please login again.") {
         dispatch({ type: USER_LOGOUT });
      }
   }
};


// User Delete Action
export const deleteUserAction = (userId) => async (dispatch) => {
   try {
      dispatch({ type: USER_DELETE_REQUEST });

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
         throw new Error("No authentication token found");
      }

      const config = {
         method: 'delete',
         url: `${BASE_URL}/api/users/${userId}`,
         headers: {
            'Authorization': `Bearer ${accessToken}`
         }
      };

      try {
         const { data } = await axios(config);
      } catch (error) {
         if (error.response?.status === 401) {
            // If unauthorized, try to refresh token and retry
            await refreshTokenAndRetry(config);
         } else {
            throw error;
         }
      }

      dispatch({
         type: USER_DELETE_SUCCESS,
         payload: { _id: userId }
      });

      // Refresh user list after successful deletion
      dispatch(userListAction());

   } catch (error) {
      dispatch({
         type: USER_DELETE_FAIL,
         payload: error.message || "Failed to delete user"
      });

      // If error is due to authentication, logout user
      if (error.message === "Session expired. Please login again.") {
         dispatch({ type: USER_LOGOUT });
      }
   }
};


export const clearProfileError = () => ({
   type: USER_PROFILE_ERROR_CLEAR
});


// Update User Profile Action
export const updateUserProfileAction = (userData) => async (dispatch) => {
   try {
      dispatch({ type: USER_PROFILE_UPDATE_REQUEST });

      // First try to get token from localStorage
      let token = localStorage.getItem("accessToken");

      // If not found in localStorage, try to get from userInfo
      if (!token) {
         const userInfo = JSON.parse(localStorage.getItem("userInfo"));
         token = userInfo?.token;
      }

      if (!token) {
         throw new Error("No authentication token found");
      }

      const config = {
         method: 'put',
         url: `${BASE_URL}/api/users/profile`,
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
         },
         data: userData
      };

      const { data } = await axios(config);

      // Update user info in localStorage and state
      const updatedUserInfo = {
         ...JSON.parse(localStorage.getItem("userInfo")),
         ...data,
         token  // Maintain the token
      };

      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      dispatch({
         type: USER_PROFILE_UPDATE_SUCCESS,
         payload: updatedUserInfo
      });

      dispatch({
         type: USER_LOGIN_REQ_SUCCESS,
         payload: updatedUserInfo
      });

   } catch (error) {
      dispatch({
         type: USER_PROFILE_UPDATE_FAIL,
         payload: error.response?.data?.message || error.message,
      });
   }
};


// Action to request reset code
export const requestPasswordResetCode = (email) => async (dispatch) => {
   try {
      dispatch({ type: 'PASSWORD_RESET_CODE_REQUEST' });

      const config = {
         headers: {
            'Content-Type': 'application/json',
         },
      };

      const { data } = await axios.post(
         `${BASE_URL}/api/users/forgot-password`, // Add BASE_URL here
         { email },
         config
      );

      dispatch({ type: 'PASSWORD_RESET_CODE_SUCCESS', payload: data });
      return true;
   } catch (error) {
      dispatch({
         type: 'PASSWORD_RESET_CODE_FAIL',
         payload: error.response?.data?.message || 'Failed to send reset code'
      });
      return false;
   }
};

// Action to reset password
export const resetPassword = (email, resetCode, newPassword) => async (dispatch) => {
   try {
      dispatch({ type: 'PASSWORD_RESET_REQUEST' });

      const response = await fetch(`${BASE_URL}/api/users/reset-password`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({ email, resetCode, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.message || 'Failed to reset password');
      }

      dispatch({ type: 'PASSWORD_RESET_SUCCESS', payload: data });
      return true;
   } catch (error) {
      dispatch({
         type: 'PASSWORD_RESET_FAIL',
         payload: error.message || 'An error occurred while resetting password',
      });
      return false;
   }
};


export const clearPasswordResetError = () => ({
   type: 'CLEAR_PASSWORD_RESET_ERROR'
});


// Change password
export const changePasswordAction = (passwords) => async (dispatch, getState) => {
   try {
      dispatch({ type: 'PASSWORD_CHANGE_REQUEST' });

      const { userLoginReducer: { userInfo } } = getState();

      if (!userInfo?.token) {
         throw new Error('Authentication token is missing');
      }

      const response = await fetch(`${BASE_URL}/api/users/change-password`, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
         },
         body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword
         }),
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.message || 'Failed to change password');
      }

      dispatch({ type: 'PASSWORD_CHANGE_SUCCESS' });
      return true;
   } catch (error) {
      console.error('Frontend password change error:', {
         message: error.message,
         name: error.name
      });

      dispatch({
         type: 'PASSWORD_CHANGE_FAIL',
         payload: error.message
      });

      throw error;
   }
};