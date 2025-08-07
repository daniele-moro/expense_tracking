/**
 * Basic tests for Login component
 * Simple smoke tests to verify login form renders correctly
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

// Mock useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

const LoginWrapper: React.FC = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
);

describe('Login Component', () => {
  test('renders login form without crashing', () => {
    render(<LoginWrapper />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('displays registration link', () => {
    render(<LoginWrapper />);
    expect(screen.getByText("Don't have an account? Sign Up")).toBeInTheDocument();
  });
});