import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Toast from '../src/components/Toast';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

// Mock timers
jest.useFakeTimers();

describe('Toast Component', () => {
  const mockOnClose = jest.fn();
  
  const defaultProps = {
    message: 'Test message',
    type: 'success',
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('renders success toast with correct styling', () => {
      render(<Toast {...defaultProps} />);
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      
      const toastElement = screen.getByText('Test message').closest('div');
      expect(toastElement).toHaveClass('bg-green-50', 'text-green-800', 'border-green-200');
    });

    test('renders error toast with correct styling', () => {
      render(<Toast {...defaultProps} type="error" />);
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
      
      const toastElement = screen.getByText('Test message').closest('div');
      expect(toastElement).toHaveClass('bg-red-50', 'text-red-800', 'border-red-200');
    });

    test('renders info toast with correct styling', () => {
      render(<Toast {...defaultProps} type="info" />);
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      
      const toastElement = screen.getByText('Test message').closest('div');
      expect(toastElement).toHaveClass('bg-blue-50', 'text-blue-800', 'border-blue-200');
    });

    test('defaults to success type when type is not provided', () => {
      const propsWithoutType = { ...defaultProps };
      delete propsWithoutType.type;
      
      render(<Toast {...propsWithoutType} />);
      
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      const toastElement = screen.getByText('Test message').closest('div');
      expect(toastElement).toHaveClass('bg-green-50');
    });

    test('renders close button', () => {
      render(<Toast {...defaultProps} />);
      
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<Toast {...defaultProps} />);
      
      const closeButton = screen.getByRole('button');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when toast is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<Toast {...defaultProps} />);
      
      const toastElement = screen.getByText('Test message').closest('div');
      await user.click(toastElement);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auto-dismiss behavior', () => {
    test('automatically closes after timeout', () => {
      render(<Toast {...defaultProps} />);
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
      
      // Fast-forward time by 5 seconds (default timeout)
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('uses custom timeout when provided', () => {
      render(<Toast {...defaultProps} timeout={3000} />);
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
      
      // Fast-forward time by 2.5 seconds (less than custom timeout)
      act(() => {
        jest.advanceTimersByTime(2500);
      });
      
      expect(mockOnClose).not.toHaveBeenCalled();
      
      // Fast-forward time by another 1 second (exceeds custom timeout)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('clears timeout when component unmounts', () => {
      const { unmount } = render(<Toast {...defaultProps} />);
      
      unmount();
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Message handling', () => {
    test('renders long messages correctly', () => {
      const longMessage = 'This is a very long message that should be displayed properly in the toast notification component without breaking the layout';
      
      render(<Toast {...defaultProps} message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    test('renders empty message', () => {
      render(<Toast {...defaultProps} message="" />);
      
      expect(screen.getByText('')).toBeInTheDocument();
    });

    test('handles special characters in message', () => {
      const specialMessage = 'Success! Contract #123 @ 🎉 added successfully.';
      
      render(<Toast {...defaultProps} message={specialMessage} />);
      
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });

  describe('Animation and styling', () => {
    test('has correct positioning classes', () => {
      render(<Toast {...defaultProps} />);
      
      const toastElement = screen.getByText('Test message').closest('div');
      expect(toastElement).toHaveClass('fixed', 'top-4', 'right-4', 'z-50');
    });

    test('has animation classes', () => {
      render(<Toast {...defaultProps} />);
      
      const toastElement = screen.getByText('Test message').closest('div');
      expect(toastElement).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
    });

    test('has proper shadow and border radius', () => {
      render(<Toast {...defaultProps} />);
      
      const toastElement = screen.getByText('Test message').closest('div');
      expect(toastElement).toHaveClass('shadow-lg', 'rounded-lg');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<Toast {...defaultProps} />);
      
      const toastElement = screen.getByText('Test message').closest('div');
      expect(toastElement).toHaveAttribute('role', 'alert');
    });

    test('close button is keyboard accessible', () => {
      render(<Toast {...defaultProps} />);
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeVisible();
      expect(closeButton).not.toHaveAttribute('disabled');
    });

    test('has proper button accessibility attributes', () => {
      render(<Toast {...defaultProps} />);
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    });
  });

  describe('Edge cases', () => {
    test('handles missing onClose prop gracefully', () => {
      const propsWithoutOnClose = { ...defaultProps };
      delete propsWithoutOnClose.onClose;
      
      expect(() => {
        render(<Toast {...propsWithoutOnClose} />);
      }).not.toThrow();
    });

    test('handles invalid type gracefully', () => {
      render(<Toast {...defaultProps} type="invalid" />);
      
      // Should default to success styling
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    test('handles null message', () => {
      render(<Toast {...defaultProps} message={null} />);
      
      // Should still render the toast container
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
