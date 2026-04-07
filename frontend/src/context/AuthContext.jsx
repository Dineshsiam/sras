import { createContext, useContext, useReducer, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

const initialState = {
  user: JSON.parse(localStorage.getItem('sars_user') || 'null'),
  token: localStorage.getItem('sars_token') || null,
  loading: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload.user, token: action.payload.token, error: null };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...initialState, user: null, token: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await authApi.login({ email, password });
      const { token, ...user } = res.data;
      localStorage.setItem('sars_token', token);
      localStorage.setItem('sars_user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: message });
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('sars_token');
    localStorage.removeItem('sars_user');
    dispatch({ type: 'LOGOUT' });
  };

  // Helper role checks
  const isAdmin = state.user?.role === 'ADMIN';
  const isAnalyst = state.user?.role === 'ANALYST';
  const isManager = state.user?.role === 'MANAGER';
  const isEmployee = state.user?.role === 'EMPLOYEE';
  const canAnalyze = isAdmin || isManager || isAnalyst;
  const canValidate = isAdmin || isAnalyst;
  const canReportView = isAdmin || isManager;

  return (
    <AuthContext.Provider value={{
      ...state, login, logout,
      isAdmin, isAnalyst, isManager, isEmployee,
      canAnalyze, canValidate, canReportView,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
