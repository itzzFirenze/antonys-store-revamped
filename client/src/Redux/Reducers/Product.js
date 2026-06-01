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
   DECREASE_PRODUCT_QUANTITY_SUCCESS,
   PRODUCT_DETAIL_RESET
} from "../Constants/Product";

// List of products
export const productListReducer = (state = { products: [] }, action) => {
   switch (action.type) {
      case PRODUCT_LIST_REQ:
         return {
            loading: true,
            products: [],
         };

      case PRODUCT_LIST_REQ_SUCCESS:
         return {
            loading: false,
            products: action.payload,
            totalPage: action.payload.totalPage,
            page: action.payload.page,
         };

      case PRODUCT_LIST_REQ_FAIL:
         return {
            loading: false,
            error: action.payload.error,
         };

      // Handle product delete
      case PRODUCT_DELETE_REQ:
         return { ...state, loadingDelete: true };

      case PRODUCT_DELETE_REQ_SUCCESS:
         return {
            ...state,
            loadingDelete: false,
            products: state.products.filter(
               (product) => product._id !== action.payload // Remove deleted product by id
            ),
         };

      case PRODUCT_DELETE_REQ_FAIL:
         return {
            ...state,
            loadingDelete: false,
            error: action.payload,
         };

      // Add these new cases to your productListReducer
      case DECREASE_PRODUCT_QUANTITY_SUCCESS:
         return {
            ...state,
            products: state.products.map(product =>
               product._id === action.payload._id ? action.payload : product
            )
         };
      case DECREASE_PRODUCT_QUANTITY_FAIL:
         return {
            ...state,
            error: action.payload
         };

      default:
         return state;
   }
};

// Single product by ID reducer
export const productReducer = (state = { product: { reviews: [] } }, action) => {
   switch (action.type) {
      case PRODUCT_DETAIL_REQ:
         return {
            loading: true,
            product: {}, // Clear previous product data
         };
      case PRODUCT_DETAIL_REQ_SUCCESS:
         return {
            loading: false,
            product: action.payload,
         };
      case PRODUCT_DETAIL_REQ_FAIL:
         return {
            loading: false,
            error: action.payload,
         };
      case PRODUCT_DETAIL_RESET:
         return {
            ...state,
            product: null
         };
      default:
         return state;
   }
};