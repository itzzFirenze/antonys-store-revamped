import axios from "axios";
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
import { BASE_URL } from "../Constants/BASE_URL";

// Fetch order list action
export const fetchOrderListAction = (userId = null) => async (dispatch) => {
   try {
     dispatch({ type: ORDER_LIST_REQ });
     
     // Make URL conditional on whether userId is provided
     const url = userId 
       ? `${BASE_URL}/api/orders?userId=${userId}`
       : `${BASE_URL}/api/orders`;
       
     const { data } = await axios.get(url);
     
     dispatch({
       type: ORDER_LIST_SUCCESS,
       // Ensure we handle both possible response formats
       payload: Array.isArray(data) ? data : data.orders || [],
     });
   } catch (error) {
     dispatch({
       type: ORDER_LIST_FAIL,
       payload: error.response && error.response.data.message 
         ? error.response.data.message 
         : error.message,
     });
   }
 };

// Fetch order detail action
export const fetchOrderDetailAction = (id) => async (dispatch) => {
   try {
      dispatch({ type: ORDER_DETAIL_REQ });

      const { data } = await axios.get(`${BASE_URL}/api/orders/${id}`);
      dispatch({
         type: ORDER_DETAIL_SUCCESS,
         payload: data,
      });
   } catch (error) {
      dispatch({
         type: ORDER_DETAIL_FAIL,
         payload: error.response && error.response.data.message ? error.response.data.message : error.message,
      });
   }
};

// Delete order action
export const deleteOrderAction = (id) => async (dispatch) => {
   try {
      dispatch({ type: ORDER_DELETE_REQ });

      // Make DELETE request to the backend
      await axios.delete(`${BASE_URL}/api/orders/${id}`);

      // Dispatch success action with the deleted order's ID
      dispatch({
         type: ORDER_DELETE_SUCCESS,
         payload: id,
      });
   } catch (error) {
      dispatch({
         type: ORDER_DELETE_FAIL,
         payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
   }
};


// Approve order action
export const approveOrderAction = (id) => async (dispatch) => {
   try {
      dispatch({ type: ORDER_APPROVE_REQ });

      // Send approval request
      const { data } = await axios.put(`${BASE_URL}/api/orders/${id}/approve`);

      // Send notifications
      await axios.post(`${BASE_URL}/api/notifications/send`, {
         orderId: data.order.orderId,
         userId: data.order.userId,
         type: "ORDER_APPROVED",
         message: `Your order ${data.order.orderId} has been approved and confirmed. Thank you for shopping with us!`,
         channels: ["email", "whatsapp"]
      });

      dispatch({
         type: ORDER_APPROVE_SUCCESS,
         payload: data.order,
      });
   } catch (error) {
      dispatch({
         type: ORDER_APPROVE_FAIL,
         payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
   }
};


// Complete order action
export const completeOrderAction = (id) => async (dispatch) => {
   try {
      dispatch({ type: ORDER_APPROVE_REQ });

      // Send request to mark the order as completed
      const { data } = await axios.put(`${BASE_URL}/api/orders/${id}/complete`);

      dispatch({
         type: ORDER_APPROVE_SUCCESS,
         payload: data.order,
      });
   } catch (error) {
      dispatch({
         type: ORDER_APPROVE_FAIL,
         payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
   }
};
