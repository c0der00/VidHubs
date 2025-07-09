import { createSlice } from '@reduxjs/toolkit';

// Default state structure
const defaultState = {
  data: {
    user: null,
    statusCode: null,
    message: null,
    success: false
  },
  isLoading: false,
  error: null,
  isAuthenticated: false
};

// Load initial state from localStorage if available
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState == null) {
      return defaultState;
    }
    return {
      ...defaultState,
      ...JSON.parse(serializedState) // merge with default to ensure full structure
    };
  } catch (err) {
    console.warn('Failed to load auth state from localStorage:', err);
    return defaultState;
  }
};

// Persist only necessary parts of the auth state
const persistState = (state) => {
  try {
    const serializableState = {
      data: state.data,
      isAuthenticated: state.isAuthenticated
    };
    localStorage.setItem('authState', JSON.stringify(serializableState));
  } catch (err) {
    console.warn('Failed to save auth state to localStorage:', err);
  }
};

const initialState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
      persistState(state);
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.data = action.payload.data;
      state.isAuthenticated = action.payload.success;
      persistState(state);
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      persistState(state);
    },
    logout: (state) => {
      state.data = {
        user: null,
        statusCode: null,
        message: null,
        success: false
      };
      state.error = null;
      state.isAuthenticated = false;
      localStorage.removeItem('authState');
    },
    updateUser: (state, action) => {
      if (state.data && state.data.user) {
        state.data.user = {
          ...state.data.user,
          ...action.payload
        };
      } else {
        state.data.user = action.payload;
      }
      persistState(state);
    }
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout,
  updateUser
} = authSlice.actions;

export default authSlice.reducer;
