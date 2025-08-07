/**
 * Basic tests for ProtectedRoute component
 * Simple smoke tests to verify route protection works
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

// Mock useAuth hook
const mockUseAuth = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const TestChild: React.FC = () => <div data-testid="protected-content">Protected Content</div>;

describe('ProtectedRoute Component', () => {
  test('renders protected content for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, email: 'test@example.com' },
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('shows loading state when checking authentication', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});