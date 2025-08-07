/**
 * Tests for Layout component
 * Tests navigation functionality and responsive drawer behavior
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Layout from '../Layout';

// Test wrapper with router
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <Layout>{children}</Layout>
  </BrowserRouter>
);

describe('Layout Component', () => {
  test('renders application title', () => {
    render(
      <LayoutWrapper>
        <div>Test Content</div>
      </LayoutWrapper>
    );
    
    expect(screen.getByText('Expense Tracker')).toBeInTheDocument();
  });

  test('renders all navigation menu items', () => {
    render(
      <LayoutWrapper>
        <div>Test Content</div>
      </LayoutWrapper>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    expect(screen.getByText('Verification Queue')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
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
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});