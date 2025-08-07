/**
 * Basic tests for AuthContext
 * Simple smoke tests to verify context provides expected interface
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../AuthContext';

// Test component to verify auth context works
const TestComponent: React.FC = () => {
  const auth = useAuth();
  return (
    <div data-testid="auth-test">
      isAuthenticated: {auth.isAuthenticated.toString()}
    </div>
  );
};

describe('AuthContext', () => {
  test('provides authentication context without crashing', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    // If we get here, the context renders without errors
    expect(true).toBe(true);
  });

  test('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});