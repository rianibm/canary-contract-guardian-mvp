import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Auth from '../src/components/Auth';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eyeoff-icon">EyeOff</div>,
  User: () => <div data-testid="user-icon">User</div>,
}));

describe('Auth Component', () => {
  const mockOnClose = jest.fn();
  const mockOnLogin = jest.fn();
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onLogin: mockOnLogin,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders login modal when isOpen is true', () => {
      render(<Auth {...defaultProps} />);
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to unlock full monitoring features')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(<Auth {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
    });

    test('renders close button', () => {
      render(<Auth {...defaultProps} />);
      
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    test('renders password toggle button', () => {
      render(<Auth {...defaultProps} />);
      
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows email validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);
      
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    test('shows password validation error for short password', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(passwordInput, '123');
      await user.click(submitButton);
      
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    test('shows required field errors when submitting empty form', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    test('clears validation errors when valid input is entered', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Enter invalid email first
      await user.type(emailInput, 'invalid');
      await user.click(submitButton);
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      
      // Clear and enter valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    test('successful login with correct credentials', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'testingcanary@gmail.com');
      await user.type(passwordInput, 'BrR123**');
      await user.click(submitButton);
      
      // Should show loading state
      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      
      // Wait for login to complete
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith({
          email: 'testingcanary@gmail.com',
          name: 'Testing Canary',
          id: 'dummy_user_123'
        });
      });
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('failed login with incorrect credentials', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'wrong@email.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
      });
      
      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('UI Interactions', () => {
    test('password visibility toggle works', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getByTestId('eye-icon').closest('button');
      
      // Initially password type
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click to hide password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('close button calls onClose', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const closeButton = screen.getByTestId('x-icon').closest('button');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('form reset after close', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      
      // Fill form
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password');
      
      // Close modal
      const closeButton = screen.getByTestId('x-icon').closest('button');
      await user.click(closeButton);
      
      // Re-render to simulate opening again
      render(<Auth {...defaultProps} />);
      
      const newEmailInput = screen.getByLabelText('Email Address');
      const newPasswordInput = screen.getByLabelText('Password');
      
      expect(newEmailInput).toHaveValue('');
      expect(newPasswordInput).toHaveValue('');
    });

    test('submit button is disabled when form is empty', () => {
      render(<Auth {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeDisabled();
    });

    test('submit button is enabled when form is valid', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      expect(submitButton).toBeEnabled();
    });
  });

  describe('Loading States', () => {
    test('prevents interaction during loading', async () => {
      const user = userEvent.setup();
      render(<Auth {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const closeButton = screen.getByTestId('x-icon').closest('button');
      
      await user.type(emailInput, 'testingcanary@gmail.com');
      await user.type(passwordInput, 'BrR123**');
      await user.click(submitButton);
      
      // During loading, all inputs should be disabled
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(closeButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<Auth {...defaultProps} />);
      
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    test('has proper button roles and types', () => {
      render(<Auth {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
      
      const toggleButton = screen.getByTestId('eye-icon').closest('button');
      expect(toggleButton).toHaveAttribute('type', 'button');
    });

    test('has proper input attributes', () => {
      render(<Auth {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('required');
      
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(passwordInput).toHaveAttribute('required');
    });
  });
});
