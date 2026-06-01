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
   USER_PROFILE_UPDATE_SUCCESS,
   USER_PROFILE_UPDATE_RESET,

   PASSWORD_RESET_CODE_FAIL,
   PASSWORD_RESET_CODE_REQUEST,
   PASSWORD_RESET_CODE_SUCCESS,

   PASSWORD_RESET_FAIL,
   PASSWORD_RESET_REQUEST,
   PASSWORD_RESET_SUCCESS,

   USER_LOGIN_CLEAR_ERROR,
   USER_REGISTER_RESET,
   USER_PROFILE_ERROR_CLEAR,

   SEND_VERIFICATION_CODE_REQUEST,
   SEND_VERIFICATION_CODE_SUCCESS,
   SEND_VERIFICATION_CODE_FAIL,

   VERIFY_CODE_REQUEST,
   VERIFY_CODE_SUCCESS,
   VERIFY_CODE_FAIL
} from "../Constants/User";


//User login
export const userLoginReducer = (state = {}, action) => {
   switch (action.type) {
      case USER_LOGIN_REQ:
         return { loading: true };
      case USER_LOGIN_REQ_SUCCESS:
         return { loading: false, userInfo: action.payload };
      case USER_LOGIN_REQ_FAIL:
         return { loading: false, error: action.payload };
      case USER_LOGIN_CLEAR_ERROR:
         return {
            ...state,
            error: null
         };
      case USER_LOGOUT:
         return {};
      default:
         return state
   }
}


//User register
export const userRegisterReducer = (state = {}, action) => {
   switch (action.type) {
      case USER_REGISTER_REQ:
         return { loading: true };
      case USER_REGISTER_REQ_SUCCESS:
         return { loading: false, userInfo: action.payload };
      case USER_REGISTER_REQ_FAIL:
         return { loading: false, error: action.payload };
      case USER_LOGOUT:
         return {};
      case USER_REGISTER_RESET:
         return { ...state, error: null };
      default:
         return state
   }
}

// User List Reducer (updated to include delete)
export const userListReducer = (state = { users: [] }, action) => {
   switch (action.type) {
      case USER_LIST_REQUEST:
         return { loading: true };
      case USER_LIST_SUCCESS:
         return { loading: false, users: action.payload };
      case USER_LIST_FAIL:
         return { loading: false, error: action.payload };
      case USER_LIST_RESET:
         return { users: [] };
      case USER_DELETE_REQUEST:
         return { ...state, loading: true };
      case USER_DELETE_SUCCESS:
         return {
            ...state,
            loading: false,
            users: state.users.filter((user) => user._id !== action.payload._id),
         };
      case USER_DELETE_FAIL:
         return { ...state, loading: false, error: action.payload };
      default:
         return state;
   }
};



// Toggle admin access
export const userAdminToggleReducer = (state = {}, action) => {
   switch (action.type) {
      case USER_ADMIN_TOGGLE_REQUEST:
         return { loading: true };
      case USER_ADMIN_TOGGLE_SUCCESS:
         return { loading: false, success: true };
      case USER_ADMIN_TOGGLE_FAIL:
         return { loading: false, error: action.payload };
      default:
         return state;
   }
};


// User Profile Update Reducer
export const userProfileUpdateReducer = (state = {}, action) => {
   switch (action.type) {
      case USER_PROFILE_UPDATE_REQUEST:
         return { loading: true };
      case USER_PROFILE_UPDATE_SUCCESS:
         return { loading: false, success: true, userInfo: action.payload };
      case USER_PROFILE_UPDATE_FAIL:
         return { loading: false, error: action.payload };
      case USER_PROFILE_UPDATE_RESET:
         return {};
      case USER_PROFILE_ERROR_CLEAR:
         return { ...state, error: null };
      default:
         return state;
   }
};


export const passwordResetReducer = (state = {}, action) => {
   switch (action.type) {
      case PASSWORD_RESET_CODE_REQUEST:
         return { loading: true };
      case PASSWORD_RESET_CODE_SUCCESS:
         return { loading: false, success: true };
      case PASSWORD_RESET_CODE_FAIL:
         return { loading: false, error: action.payload };
      case PASSWORD_RESET_REQUEST:
         return { loading: true };
      case PASSWORD_RESET_SUCCESS:
         return { loading: false, success: true };
      case PASSWORD_RESET_FAIL:
         return { loading: false, error: action.payload };
      case 'CLEAR_PASSWORD_RESET_ERROR':
         return { ...state, error: null, success: false };
      case 'PASSWORD_CHANGE_REQUEST':
         return { ...state, loading: true };
      case 'PASSWORD_CHANGE_SUCCESS':
         return { ...state, loading: false, success: true };
      case 'PASSWORD_CHANGE_FAIL':
         return { ...state, loading: false, error: action.payload };
      default:
         return state;
   }
};


export const verificationCodeReducer = (state = {}, action) => {
   switch (action.type) {
      case SEND_VERIFICATION_CODE_REQUEST:
         return { loading: true };
      case SEND_VERIFICATION_CODE_SUCCESS:
         return { loading: false, success: true };
      case SEND_VERIFICATION_CODE_FAIL:
         return { loading: false, error: action.payload };
      case VERIFY_CODE_REQUEST:
         return { ...state, verifyLoading: true };
      case VERIFY_CODE_SUCCESS:
         return { ...state, verifyLoading: false, verifySuccess: true };
      case VERIFY_CODE_FAIL:
         return { ...state, verifyLoading: false, verifyError: action.payload };
      default:
         return state;
   }
};