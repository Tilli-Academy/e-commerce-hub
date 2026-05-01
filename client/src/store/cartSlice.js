import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../services/cartService';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.getCart();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cart'
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      return await cartService.addToCart(productId, quantity);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add to cart'
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      return await cartService.updateCartItem(itemId, quantity);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update item'
      );
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      return await cartService.removeCartItem(itemId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove item'
      );
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.clearCart();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clear cart'
      );
    }
  }
);

const initialState = {
  items: [],
  totalPrice: 0,
  totalItems: 0,
  loading: false,
  error: null,
};

const setCartState = (state, cart) => {
  state.items = cart.items;
  state.totalPrice = cart.totalPrice;
  state.totalItems = cart.totalItems;
  state.loading = false;
  state.error = null;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        setCartState(state, action.payload.cart);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        setCartState(state, action.payload.cart);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        setCartState(state, action.payload.cart);
      })
      // Remove item
      .addCase(removeCartItem.fulfilled, (state, action) => {
        setCartState(state, action.payload.cart);
      })
      // Clear cart
      .addCase(clearCart.fulfilled, () => initialState);
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
