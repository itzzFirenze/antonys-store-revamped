// Redux/Actions/Wishlist.js
import axios from "axios";

// Add to wishlist
export const addToWishlist = (productId) => async (dispatch, getState) => {
    try {
        dispatch({ type: "ADD_TO_WISHLIST_REQUEST" });

        const { userLogin: { userInfo } } = getState();

        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}`,
            },
        };

        const { data } = await axios.post(
            `/api/wishlist/add/${productId}`,
            {},
            config
        );

        dispatch({ type: "ADD_TO_WISHLIST_SUCCESS", payload: data });

    } catch (error) {
        dispatch({
            type: "ADD_TO_WISHLIST_FAIL",
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });
    }
};

// Fetch wishlist
export const fetchWishlist = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "FETCH_WISHLIST_REQUEST" });

        const { userLogin: { userInfo } } = getState();

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };

        const { data } = await axios.get(`/api/wishlist`, config);

        dispatch({ type: "FETCH_WISHLIST_SUCCESS", payload: data });
    } catch (error) {
        dispatch({
            type: "FETCH_WISHLIST_FAIL",
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });
    }
};

// Remove from wishlist
export const removeFromWishlist = (productId) => async (dispatch, getState) => {
    try {
        dispatch({ type: "REMOVE_FROM_WISHLIST_REQUEST" });

        const { userLogin: { userInfo } } = getState();

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };

        await axios.delete(`/api/wishlist/remove/${productId}`, config);

        dispatch({ type: "REMOVE_FROM_WISHLIST_SUCCESS", payload: productId });
    } catch (error) {
        dispatch({
            type: "REMOVE_FROM_WISHLIST_FAIL",
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });
    }
};