import {
   ORDER_LIST_REQ,
   ORDER_LIST_SUCCESS,
   ORDER_LIST_FAIL,
   ORDER_DETAIL_REQ,
   ORDER_DETAIL_SUCCESS,
   ORDER_DETAIL_FAIL,
   ORDER_DELETE_REQ,
   ORDER_DELETE_SUCCESS,
   ORDER_DELETE_FAIL,
   ORDER_APPROVE_FAIL,
   ORDER_APPROVE_REQ,
   ORDER_APPROVE_SUCCESS
} from "../Constants/Order";

export const orderListReducer = (state = { orders: [] }, action) => {
   switch (action.type) {
     case ORDER_LIST_REQ:
       return { ...state, loading: true };
 
     case ORDER_LIST_SUCCESS:
       return {
         ...state,
         loading: false,
         orders: action.payload, // Direct array assignment
         error: null,
       };
 
     case ORDER_LIST_FAIL:
       return { 
         ...state, 
         loading: false, 
         error: action.payload,
         orders: [] 
       };

      case ORDER_APPROVE_REQ:
         return { ...state, loadingApprove: true };

      case ORDER_APPROVE_SUCCESS:
         return {
            ...state,
            loadingApprove: false,
            orders: state.orders.map(order =>
               order._id === action.payload._id ? { ...order, isCompleted: true } : order
            ),
         };

      case ORDER_APPROVE_FAIL:
         return { ...state, loadingApprove: false, error: action.payload };

      case ORDER_DELETE_SUCCESS:
         return {
            ...state,
            orders: state.orders.filter(order => order._id !== action.payload._id),
         };

      case ORDER_DELETE_FAIL:
         return { ...state, error: action.payload };

      default:
         return state;
   }
};




// Order detail reducer
export const orderDetailReducer = (state = { order: {} }, action) => {
   switch (action.type) {
      case ORDER_DETAIL_REQ:
         return { loading: true, order: {} };

      case ORDER_DETAIL_SUCCESS:
         return { loading: false, order: action.payload.order };

      case ORDER_DETAIL_FAIL:
         return { loading: false, error: action.payload };

      default:
         return state;
   }
};
