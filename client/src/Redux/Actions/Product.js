import axios from "axios";
import {
    PRODUCT_LIST_REQ,
    PRODUCT_LIST_REQ_FAIL,
    PRODUCT_LIST_REQ_SUCCESS,
    PRODUCT_DETAIL_REQ,
    PRODUCT_DETAIL_REQ_FAIL,
    PRODUCT_DETAIL_REQ_SUCCESS,
    PRODUCT_DELETE_REQ,
    PRODUCT_DELETE_REQ_SUCCESS,
    PRODUCT_DELETE_REQ_FAIL,
    DECREASE_PRODUCT_QUANTITY_FAIL,
    DECREASE_PRODUCT_QUANTITY_REQUEST,
    DECREASE_PRODUCT_QUANTITY_SUCCESS
} from "../Constants/Product";
import { BASE_URL } from "../Constants/BASE_URL";

// Delete product action
export const deleteProductAction = (id) => async (dispatch) => {
    try {
        dispatch({ type: PRODUCT_DELETE_REQ });

        // Send request to delete product
        await axios.delete(`${BASE_URL}/api/products/${id}`);

        dispatch({
            type: PRODUCT_DELETE_REQ_SUCCESS,
            payload: id, // Return the ID of the deleted product to remove from the state
        });
    } catch (error) {
        dispatch({
            type: PRODUCT_DELETE_REQ_FAIL,
            payload: error.response && error.response.data.message ? error.response.data.message : error.message,
        });
    }
};

// Fetch product list action
export const productListAction = () => async (dispatch) => {
    try {
        dispatch({ type: PRODUCT_LIST_REQ });

        const { data } = await axios.get(`${BASE_URL}/api/products`);
        dispatch({
            type: PRODUCT_LIST_REQ_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: PRODUCT_LIST_REQ_FAIL,
            payload: error.response && error.response.data.message ? error.response.data.message : error.message,
        });
    }
};

// Fetch product detail by ID action
export const productAction = (id) => async (dispatch) => {
    try {
        dispatch({ type: PRODUCT_DETAIL_REQ });

        const { data } = await axios.get(`${BASE_URL}/api/products/${id}`);
        dispatch({
            type: PRODUCT_DETAIL_REQ_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: PRODUCT_DETAIL_REQ_FAIL,
            payload: error.response && error.response.data.message ? error.response.data.message : error.message,
        });
    }
};


// Decrease product quantity
export const decreaseProductQuantityAction = (productId, quantity) => async (dispatch) => {
   try {
       dispatch({ type: DECREASE_PRODUCT_QUANTITY_REQUEST });

       const { data } = await axios.put(`${BASE_URL}/api/products/decrease-quantity/${productId}`, { quantity });

       dispatch({
           type: DECREASE_PRODUCT_QUANTITY_SUCCESS,
           payload: data
       });
   } catch (error) {
       dispatch({
           type: DECREASE_PRODUCT_QUANTITY_FAIL,
           payload: error.response && error.response.data.message 
               ? error.response.data.message 
               : error.message
       });
   }
};
