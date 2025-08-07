/**
 * Tests for Dashboard component
 * Tests financial overview display and metrics rendering
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';

// Mock MUI components that have compatibility issues
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Grid: ({ children, ...props }: any) => <div data-testid="grid" {...props}>{children}</div>,
}));

describe('Dashboard Component', () => {
  test('renders financial overview title', () => {
    render(<Dashboard />);
    expect(screen.getByText('Financial Overview')).toBeInTheDocument();
  });

  test('displays monthly expense metrics', () => {
    render(<Dashboard />);
    expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
    expect(screen.getByText('$1247.50')).toBeInTheDocument();
  });

  test('displays monthly income metrics', () => {
    render(<Dashboard />);
    expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    expect(screen.getByText('$3500.00')).toBeInTheDocument();
  });

  test('shows recent transactions section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    expect(screen.getByText('Grocery Store Receipt')).toBeInTheDocument();
    expect(screen.getByText('Gas Station')).toBeInTheDocument();
  });

  test('displays budget progress section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Budget Progress')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Utilities')).toBeInTheDocument();
  });

  test('shows upload documents button', () => {
    render(<Dashboard />);
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
  });
});