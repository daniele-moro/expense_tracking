/**
 * Basic tests for Register component
 * Simple smoke tests to verify registration form renders correctly
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';

// Mock useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: jest.fn(),
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

const RegisterWrapper: React.FC = () => (
  <BrowserRouter>
    <Register />
  </BrowserRouter>
);

describe('Register Component', () => {
  test('renders registration form without crashing', () => {
    render(<RegisterWrapper />);
    
    expect(screen.getAllByText('Sign Up').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('displays terms and conditions checkbox', () => {
    render(<RegisterWrapper />);
    expect(screen.getByLabelText(/accept.*terms/i)).toBeInTheDocument();
  });

  test('displays login link', () => {
    render(<RegisterWrapper />);
    expect(screen.getByText('Already have an account? Sign In')).toBeInTheDocument();
  });

  test('displays password requirements', () => {
    render(<RegisterWrapper />);
    expect(screen.getByText(/Password must be at least 8 characters with uppercase, lowercase, number, and special character/)).toBeInTheDocument();
  });
});