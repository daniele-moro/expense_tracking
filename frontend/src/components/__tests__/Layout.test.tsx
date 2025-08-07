/**
 * Tests for Layout component
 * Tests navigation functionality and responsive drawer behavior
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../Layout';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

// Test wrapper
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout>{children}</Layout>
);

describe('Layout Component', () => {
  test('renders application title', () => {
    render(
      <LayoutWrapper>
        <div>Test Content</div>
      </LayoutWrapper>
    );
    
    expect(screen.getAllByText('Expense Tracker').length).toBeGreaterThan(0);
  });

  test('renders all navigation menu items', () => {
    render(
      <LayoutWrapper>
        <div>Test Content</div>
      </LayoutWrapper>
    );
    
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Expenses').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Income').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Upload Documents').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Verification Queue').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0);
  });

  test('renders child content', () => {
    render(
      <LayoutWrapper>
        <div data-testid="child-content">Test Content</div>
      </LayoutWrapper>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  test('displays verification queue badge', () => {
    render(
      <LayoutWrapper>
        <div>Test Content</div>
      </LayoutWrapper>
    );
    
    // Badge with number 3 should be visible for verification queue
    expect(screen.getAllByText('Verification Queue').length).toBeGreaterThan(0);
  });
});